import {
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  index,
} from "drizzle-orm/pg-core";

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    guid: varchar("guid", { length: 512 }).notNull().unique(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    source: varchar("source", { length: 100 }).notNull(),
    author: varchar("author", { length: 255 }),
    summary: text("summary"),
    imageUrl: text("image_url"),
    category: varchar("category", { length: 50 }).notNull().default("General"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_articles_published_at").on(table.publishedAt),
    index("idx_articles_source").on(table.source),
    index("idx_articles_category").on(table.category),
  ]
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
