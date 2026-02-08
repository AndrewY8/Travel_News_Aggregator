"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/lib/types";
import { DateTime } from "luxon";

const CATEGORY_COLORS: Record<string, string> = {
  Airline: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Hotel: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "Travel Bonus": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  General: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const SOURCE_COLORS: Record<string, string> = {
  "The Points Guy": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Skift: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "One Mile at a Time": "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
};

function formatRelativeTime(dateStr: string): string {
  const dt = DateTime.fromISO(dateStr, { zone: "utc" }).toLocal();
  const now = DateTime.local();
  const diff = now.diff(dt, ["hours", "minutes"]);

  if (diff.hours < 1) {
    const mins = Math.floor(diff.minutes);
    return mins <= 1 ? "Just now" : `${mins}m ago`;
  }
  if (diff.hours < 24) {
    return `${Math.floor(diff.hours)}h ago`;
  }
  return dt.toRelativeCalendar() || dt.toFormat("MMM d, yyyy");
}

export function ArticleCard({ article }: { article: Article }) {
  const categoryColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.General;
  const sourceColor = SOURCE_COLORS[article.source] || "bg-gray-100 text-gray-800";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/50">
        {article.imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge variant="outline" className={sourceColor}>
              {article.source}
            </Badge>
            <Badge variant="outline" className={categoryColor}>
              {article.category}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatRelativeTime(article.publishedAt)}
            </span>
          </div>
          <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary/80 transition-colors">
            {article.title}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          {article.summary && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {article.summary}
            </p>
          )}
          {article.author && (
            <p className="text-xs text-muted-foreground mt-2">
              By {article.author}
            </p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
