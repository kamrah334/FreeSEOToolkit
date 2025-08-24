import { z } from "zod";

// Meta Description Generator
export const metaDescriptionRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  audience: z.string().optional(),
});

export const metaDescriptionResponseSchema = z.object({
  content: z.string(),
  length: z.number(),
});

// Title Case Converter
export const titleCaseRequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export const titleCaseResponseSchema = z.object({
  original: z.string(),
  converted: z.string(),
  rulesApplied: z.array(z.string()),
});

// Keyword Density Analyzer
export const keywordDensityRequestSchema = z.object({
  content: z.string().min(50, "Content must be at least 50 words"),
});

export const keywordDensityResponseSchema = z.object({
  totalWords: z.number(),
  uniqueKeywords: z.number(),
  keywords: z.array(z.object({
    word: z.string(),
    frequency: z.number(),
    density: z.number(),
    status: z.enum(["low", "good", "optimal", "high"]),
  })),
  avgDensity: z.number(),
  topKeywordDensity: z.number(),
});

// Blog Outline Generator
export const blogOutlineRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  audience: z.string().optional(),
  length: z.enum(["short", "medium", "long"]).default("medium"),
});

export const blogOutlineResponseSchema = z.object({
  title: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    level: z.number(),
    subsections: z.array(z.string()).optional(),
  })),
  estimatedWordCount: z.number(),
  estimatedReadingTime: z.number(),
});

// Type exports
export type MetaDescriptionRequest = z.infer<typeof metaDescriptionRequestSchema>;
export type MetaDescriptionResponse = z.infer<typeof metaDescriptionResponseSchema>;
export type TitleCaseRequest = z.infer<typeof titleCaseRequestSchema>;
export type TitleCaseResponse = z.infer<typeof titleCaseResponseSchema>;
export type KeywordDensityRequest = z.infer<typeof keywordDensityRequestSchema>;
export type KeywordDensityResponse = z.infer<typeof keywordDensityResponseSchema>;
export type BlogOutlineRequest = z.infer<typeof blogOutlineRequestSchema>;
export type BlogOutlineResponse = z.infer<typeof blogOutlineResponseSchema>;
