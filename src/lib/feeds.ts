import Parser from "rss-parser";
import { DateTime } from "luxon";
import { categorizeArticle } from "./categorize";
import type { NewArticle } from "./schema";

// Extend rss-parser to handle media:content and enclosure
type CustomItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  content?: string;
  contentSnippet?: string;
  "content:encoded"?: string;
  "content:encodedSnippet"?: string;
  guid?: string;
  enclosure?: { url?: string; type?: string; length?: string };
  "media:content"?: {
    $?: { url?: string; medium?: string; type?: string };
  };
};

type CustomFeed = {
  title?: string;
  link?: string;
};

const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["enclosure", "enclosure"],
    ],
  },
});

interface FeedSource {
  name: string;
  url: string;
}

export const FEED_SOURCES: FeedSource[] = [
  { name: "The Points Guy", url: "https://thepointsguy.com/feed/" },
  { name: "Skift", url: "https://skift.com/feed/" },
  { name: "One Mile at a Time", url: "https://onemileatatime.com/feed/" },
];

function parseDate(raw: string | undefined): Date {
  if (!raw) return new Date();

  // Try ISO 8601 first (used by The Points Guy)
  const iso = DateTime.fromISO(raw, { zone: "utc" });
  if (iso.isValid) return iso.toJSDate();

  // Then RFC 2822 (used by Skift & OMAAT)
  const rfc = DateTime.fromRFC2822(raw, { zone: "utc" });
  if (rfc.isValid) return rfc.toJSDate();

  // Fallback: JS native Date parser
  const fallback = new Date(raw);
  if (!isNaN(fallback.getTime())) return fallback;

  return new Date();
}

function extractImageUrl(item: CustomItem): string | null {
  // 1) media:content (TPG & Skift)
  const media = item["media:content"];
  if (media?.$?.url) return media.$.url;

  // 2) enclosure (OMAAT)
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
    return item.enclosure.url;
  }

  // 3) First <img> tag in content
  const html = item["content:encoded"] || item.content || "";
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch?.[1]) return imgMatch[1];

  return null;
}

function extractDescription(item: CustomItem): string {
  // Prefer contentSnippet (plain text) over encoded content
  const snippet =
    item.contentSnippet || item["content:encodedSnippet"] || "";
  if (snippet) {
    // Trim to ~300 chars for card display
    return snippet.length > 300
      ? snippet.slice(0, 297) + "..."
      : snippet;
  }

  // Strip HTML from description if needed
  const desc = item.content || item["content:encoded"] || "";
  const stripped = desc.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 300
    ? stripped.slice(0, 297) + "..."
    : stripped;
}

function buildGuid(item: CustomItem, source: string): string {
  // Use the RSS guid if available, otherwise build from link + source
  return item.guid || `${source}::${item.link}`;
}

export async function fetchAndNormalizeFeed(
  source: FeedSource
): Promise<NewArticle[]> {
  const feed = await parser.parseURL(source.url);

  return feed.items.map((item) => ({
    guid: buildGuid(item, source.name),
    title: item.title?.trim() || "Untitled",
    url: item.link || "",
    source: source.name,
    author: item.creator || item.author || null,
    description: extractDescription(item),
    imageUrl: extractImageUrl(item),
    category: categorizeArticle(item.title || ""),
    publishedAt: parseDate(item.pubDate),
  }));
}

export async function fetchAllFeeds(): Promise<{
  articles: NewArticle[];
  errors: { source: string; error: string }[];
}> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map((source) => fetchAndNormalizeFeed(source))
  );

  const articles: NewArticle[] = [];
  const errors: { source: string; error: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      errors.push({
        source: FEED_SOURCES[i].name,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  });

  return { articles, errors };
}
