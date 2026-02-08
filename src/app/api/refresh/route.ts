import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { fetchAllFeeds } from "@/lib/feeds";
import { sql } from "drizzle-orm";

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
    const { articles: newArticles, errors } = await fetchAllFeeds();

    let upsertedCount = 0;

    if (newArticles.length > 0) {
      // Batch upsert — skip conflicts on guid
      for (const article of newArticles) {
        await db
          .insert(articles)
          .values(article)
          .onConflictDoUpdate({
            target: articles.guid,
            set: {
              title: sql`excluded.title`,
              description: sql`excluded.description`,
              imageUrl: sql`excluded.image_url`,
              category: sql`excluded.category`,
              author: sql`excluded.author`,
            },
          });
        upsertedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      upserted: upsertedCount,
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
