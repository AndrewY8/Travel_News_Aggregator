import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { desc, eq, and, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build conditions array
    const conditions = [];
    if (source) conditions.push(eq(articles.source, source));
    if (category) conditions.push(eq(articles.category, category));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(articles)
      .where(where)
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ total }] = await db
      .select({ total: count() })
      .from(articles)
      .where(where);

    return NextResponse.json(
      {
        articles: results,
        total,
        limit,
        offset,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Feed fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch articles",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
