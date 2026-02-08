export interface Article {
  id: number;
  guid: string;
  title: string;
  url: string;
  source: string;
  author: string | null;
  summary: string | null;
  imageUrl: string | null;
  category: string;
  publishedAt: string;
  createdAt: string;
}

export interface FeedResponse {
  articles: Article[];
  total: number;
  limit: number;
  offset: number;
}
