import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { fetchAllFeeds } from "@/lib/feeds";
import { summarizeArticles } from "@/lib/summarize";
import { sql, inArray } from "drizzle-orm";

// Vercel Cron sends GET requests
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleRefresh(request);
}

export async function POST(request: NextRequest) {
  return handleRefresh(request);
}

async function handleRefresh(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { articles: fetchedItems, errors } = await fetchAllFeeds();

    if (fetchedItems.length === 0) {
      return NextResponse.json({
        success: true,
        upserted: 0,
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    // Check which articles already have summaries to avoid re-calling OpenAI
    const guids = fetchedItems.map((item) => item.article.guid);
    const existing = await db
      .select({ guid: articles.guid, summary: articles.summary })
      .from(articles)
      .where(inArray(articles.guid, guids));

    const existingSummaries = new Map(
      existing
        .filter((e) => e.summary)
        .map((e) => [e.guid, e.summary!])
    );

    // Split into items needing summaries vs already having them
    const needsSummary = fetchedItems.filter(
      (item) => !existingSummaries.has(item.article.guid)
    );
    const hasSummary = fetchedItems.filter((item) =>
      existingSummaries.has(item.article.guid)
    );

    // Generate summaries for new articles only
    const summarized = await summarizeArticles(needsSummary);

    // Merge with existing summaries
    const allArticles = [
      ...summarized,
      ...hasSummary.map((item) => ({
        ...item.article,
        summary: existingSummaries.get(item.article.guid) || null,
      })),
    ];

    // Upsert all
    let upsertedCount = 0;
    for (const article of allArticles) {
      await db
        .insert(articles)
        .values(article)
        .onConflictDoUpdate({
          target: articles.guid,
          set: {
            title: sql`excluded.title`,
            summary: sql`excluded.summary`,
            imageUrl: sql`excluded.image_url`,
            category: sql`excluded.category`,
            author: sql`excluded.author`,
          },
        });
      upsertedCount++;
    }

    return NextResponse.json({
      success: true,
      upserted: upsertedCount,
      summarized: needsSummary.length,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      {
        error: "Failed to refresh feeds",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
