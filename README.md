# Travel News Aggregator

A real-time travel news dashboard that pulls articles from multiple RSS feeds (The Points Guy, Skift, One Mile at a Time), normalizes the data, and displays them in a clean, filterable interface with AI-generated summaries.

**Live:** [travel-news-aggregator.vercel.app](https://travel-news-aggregator.vercel.app)

## Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Postgres (Neon) via Drizzle ORM
- **RSS Parsing:** rss-parser + Luxon for timezone normalization
- **AI Summaries:** OpenAI GPT-4o-mini
- **Deployment:** Vercel + GitHub Actions (cron-based feed refresh)

### What prompt did you use to code this project up?

The project was built iteratively through a conversation with Claude Code. Examples of prompts included:
"Read the feeds describe how each RSS feed are currently formatted given https://thepointsguy.com/feed/ https://skift.com/feed/ https://onemileatatime.com/feed/ and provide that in a context file" ""The three feeds use different date formats, TPG uses ISO 8601, Skift and OMAAT use RFC 2822. Write a typescript function using Luxon that handles both formats and normalizes everything to UTC"

### Why did you choose your specific caching/storage strategy?

I chose this approach to keep the system fast, reliable, and inexpensive while matching how a news dashboard is actually used. Travel news changes every few minutes, so it did not make sense to fetch RSS feeds on every request.

Instead, articles are fetched and normalized every 15 minutes and stored in Neon Postgres. All user requests read from the database rather than the upstream feeds. I chose Postgres over an in memory cache because serverless functions do not share memory across instances. Using a durable store ensures every request sees the same dataset. Neon’s serverless driver also keeps connection overhead low in this environment.

On top of that, the API response is cached at the CDN using Cache Control headers. Most page loads are served directly from Vercel’s edge network without hitting the database at all. This improves latency and reduces database load.
