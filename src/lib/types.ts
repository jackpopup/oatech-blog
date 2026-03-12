import { z } from 'zod/v4';

export const VALID_CATEGORIES = ['운영팁', '창업가이드', '트렌드', '사례'] as const;
export type Category = typeof VALID_CATEGORIES[number];

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(VALID_CATEGORIES),
  tags: z.array(z.string()),
  description: z.string().max(200),
  thumbnail: z.string().optional(),
  draft: z.boolean().optional(),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export interface Post extends PostFrontmatter {
  slug: string;
  content: string;
  readingTime: number;
}

export interface KeywordEntry {
  keyword: string;
  subKeywords: string[];
  used: boolean;
  lastUsedAt?: string;
}

export interface KeywordDB {
  categories: Record<Category, KeywordEntry[]>;
}
