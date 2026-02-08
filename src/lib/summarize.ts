import OpenAI from "openai";
import type { ArticleWithSnippet } from "./feeds";
import type { NewArticle } from "./schema";

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

async function summarizeOne(
  title: string,
  snippet: string
): Promise<string | null> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a travel news editor. Given an article title and excerpt, write exactly one concise sentence summarizing the key takeaway. No preamble, no quotes — just the sentence.",
        },
        {
          role: "user",
          content: `Title: ${title}\n\nExcerpt: ${snippet}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error(`Summary failed for "${title}":`, error);
    return null;
  }
}

export async function summarizeArticles(
  items: ArticleWithSnippet[]
): Promise<NewArticle[]> {
  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  const results: NewArticle[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const summaries = await Promise.all(
      batch.map(({ article, snippet }) =>
        summarizeOne(article.title, snippet)
      )
    );

    batch.forEach(({ article }, idx) => {
      results.push({
        ...article,
        summary: summaries[idx],
      });
    });
  }

  return results;
}
