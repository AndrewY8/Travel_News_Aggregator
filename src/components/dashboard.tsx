"use client";

import { useEffect, useState, useCallback } from "react";
import { DateTime } from "luxon";
import { ArticleCard } from "./article-card";
import { ArticleSkeleton } from "./article-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Article, FeedResponse } from "@/lib/types";

const SOURCES = ["All", "The Points Guy", "Skift", "One Mile at a Time"];
const CATEGORIES = ["All", "Airline", "Hotel", "Travel Bonus", "General"];

function groupByDay(articles: Article[]): Map<string, Article[]> {
  const groups = new Map<string, Article[]>();
  const now = DateTime.local();
  const today = now.startOf("day");
  const yesterday = today.minus({ days: 1 });

  for (const article of articles) {
    const dt = DateTime.fromISO(article.publishedAt, { zone: "utc" }).toLocal();
    const articleDay = dt.startOf("day");

    let label: string;
    if (articleDay >= today) {
      label = "Today";
    } else if (articleDay >= yesterday) {
      label = "Yesterday";
    } else {
      label = dt.toFormat("EEEE, MMMM d");
    }

    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(article);
  }

  return groups;
}

export function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState("All");
  const [category, setCategory] = useState("All");
  const [total, setTotal] = useState(0);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (source !== "All") params.set("source", source);
      if (category !== "All") params.set("category", category);
      params.set("limit", "100");

      const res = await fetch(`/api/feed?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: FeedResponse = await res.json();
      setArticles(data.articles);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [source, category]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const grouped = groupByDay(articles);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold tracking-tight text-center mb-4">
            Travel News
          </h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Source
              </span>
              {SOURCES.map((s) => (
                <Button
                  key={s}
                  variant={source === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSource(s)}
                  className="h-7 text-xs"
                >
                  {s}
                </Button>
              ))}
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-6 self-center" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Category
              </span>
              {CATEGORIES.map((c) => (
                <Button
                  key={c}
                  variant={category === c ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(c)}
                  className="h-7 text-xs"
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
            <p className="text-sm text-destructive font-medium">
              Failed to load articles: {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchArticles}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No articles found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}

        {/* Articles grouped by day */}
        {!loading &&
          Array.from(grouped.entries()).map(([day, dayArticles]) => (
            <section key={day} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold">{day}</h2>
                <Badge variant="secondary" className="text-xs">
                  {dayArticles.length} article{dayArticles.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dayArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          ))}
      </main>
    </div>
  );
}
