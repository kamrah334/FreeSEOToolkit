import { VercelRequest, VercelResponse } from '@vercel/node';
import { keywordDensityRequestSchema, type KeywordDensityResponse } from "../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { content } = keywordDensityRequestSchema.parse(req.body);
    
    // Clean and split content into words
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out very short words

    const totalWords = words.length;
    
    // Count word frequencies
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Calculate keyword density and status
    const keywords = Array.from(wordCount.entries())
      .map(([word, frequency]) => {
        const density = (frequency / totalWords) * 100;
        let status: "low" | "good" | "optimal" | "high";
        
        if (density < 1) status = "low";
        else if (density < 2) status = "good";
        else if (density < 4) status = "optimal";
        else status = "high";

        return { word, frequency, density: Number(density.toFixed(2)), status };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20); // Top 20 keywords

    const avgDensity = Number((keywords.reduce((sum, k) => sum + k.density, 0) / keywords.length).toFixed(2));
    const topKeywordDensity = keywords[0]?.density || 0;

    const response: KeywordDensityResponse = {
      totalWords,
      uniqueKeywords: wordCount.size,
      keywords,
      avgDensity,
      topKeywordDensity,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Keyword density analysis error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to analyze keyword density" 
    });
  }
}