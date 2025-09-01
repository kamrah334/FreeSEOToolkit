import { z } from "zod";

const SeoTitleSchema = z.object({
  keywords: z.string().min(1, "Keywords are required"),
  imageContext: z.string().optional(),
});

interface SeoTitleResponse {
  seoTitle: string;
  relatedKeywords: string[];
  keywordString: string;
  titleScore: number;
  suggestions: string[];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const validatedData = SeoTitleSchema.parse(req.body);
    const { keywords, imageContext } = validatedData;

    // Split and clean keywords
    const keywordArray = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
    
    // Generate SEO title (simulated AI response)
    const primaryKeyword = keywordArray[0] || 'image';
    const seoTitle = generateSeoTitle(keywordArray, imageContext);
    
    // Generate 30 related keywords
    const relatedKeywords = generateRelatedKeywords(keywordArray, imageContext);
    const keywordString = relatedKeywords.join(', ');
    
    // Calculate title score
    const titleScore = calculateTitleScore(seoTitle, keywordArray);
    
    // Generate suggestions
    const suggestions = generateSuggestions(seoTitle, keywordArray);

    const response: SeoTitleResponse = {
      seoTitle,
      relatedKeywords,
      keywordString,
      titleScore,
      suggestions,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('SEO Title Generation Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

function generateSeoTitle(keywords: string[], imageContext?: string): string {
  const templates = [
    `${capitalizeFirst(keywords[0])} Guide: ${capitalizeFirst(keywords[1] || 'Complete')} ${capitalizeFirst(keywords[2] || 'Tutorial')}`,
    `Best ${capitalizeFirst(keywords[0])} ${capitalizeFirst(keywords[1] || 'Tips')} for ${capitalizeFirst(keywords[2] || 'Success')}`,
    `Ultimate ${capitalizeFirst(keywords[0])} ${capitalizeFirst(keywords[1] || 'Collection')}: ${capitalizeFirst(keywords[2] || 'Professional')} Guide`,
    `How to ${capitalizeFirst(keywords[0])} ${capitalizeFirst(keywords[1] || 'Effectively')}: ${capitalizeFirst(keywords[2] || 'Expert')} Tips`,
    `${capitalizeFirst(keywords[0])} ${capitalizeFirst(keywords[1] || 'Essentials')}: Complete ${capitalizeFirst(keywords[2] || 'Resource')} Guide`,
  ];
  
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  return randomTemplate.length > 60 ? randomTemplate.substring(0, 57) + '...' : randomTemplate;
}

function generateRelatedKeywords(baseKeywords: string[], imageContext?: string): string[] {
  const keywordVariations: string[] = [];
  
  // Add base keywords
  keywordVariations.push(...baseKeywords);
  
  // Generate variations for each base keyword
  const suffixes = ['tips', 'guide', 'tutorial', 'examples', 'ideas', 'inspiration', 'design', 'photography', 'art', 'creative'];
  const prefixes = ['best', 'top', 'professional', 'modern', 'creative', 'stunning', 'beautiful', 'amazing', 'perfect', 'unique'];
  const relatedTerms = ['image', 'photo', 'picture', 'visual', 'graphic', 'artwork', 'design', 'style', 'concept', 'theme'];
  
  baseKeywords.forEach(keyword => {
    // Add suffix variations
    suffixes.forEach(suffix => {
      keywordVariations.push(`${keyword} ${suffix}`);
    });
    
    // Add prefix variations
    prefixes.forEach(prefix => {
      keywordVariations.push(`${prefix} ${keyword}`);
    });
  });
  
  // Add related terms
  keywordVariations.push(...relatedTerms);
  
  // Remove duplicates and limit to 30
  const uniqueKeywords = [...new Set(keywordVariations)];
  return uniqueKeywords.slice(0, 30);
}

function calculateTitleScore(title: string, keywords: string[]): number {
  let score = 0;
  
  // Length score (optimal 50-60 characters)
  const length = title.length;
  if (length >= 50 && length <= 60) {
    score += 30;
  } else if (length >= 40 && length <= 70) {
    score += 20;
  } else {
    score += 10;
  }
  
  // Keyword inclusion score
  const titleLower = title.toLowerCase();
  keywords.forEach(keyword => {
    if (titleLower.includes(keyword.toLowerCase())) {
      score += 15;
    }
  });
  
  // Structure score
  if (title.includes(':') || title.includes('|')) {
    score += 10;
  }
  
  // Power words score
  const powerWords = ['best', 'ultimate', 'complete', 'guide', 'tips', 'how to', 'professional'];
  powerWords.forEach(word => {
    if (titleLower.includes(word)) {
      score += 5;
    }
  });
  
  return Math.min(score, 100);
}

function generateSuggestions(title: string, keywords: string[]): string[] {
  const suggestions: string[] = [];
  
  if (title.length > 60) {
    suggestions.push('Consider shortening the title to under 60 characters for better SEO');
  }
  
  if (title.length < 40) {
    suggestions.push('Consider adding more descriptive keywords to reach 50-60 characters');
  }
  
  if (!title.toLowerCase().includes(keywords[0]?.toLowerCase())) {
    suggestions.push(`Include your primary keyword "${keywords[0]}" in the title`);
  }
  
  if (!title.includes(':') && !title.includes('|')) {
    suggestions.push('Consider using a colon or pipe separator for better structure');
  }
  
  const powerWords = ['best', 'ultimate', 'complete', 'guide', 'tips', 'how to'];
  const hasPowerWord = powerWords.some(word => title.toLowerCase().includes(word));
  if (!hasPowerWord) {
    suggestions.push('Add power words like "Best", "Ultimate", or "Complete" to increase click-through rates');
  }
  
  return suggestions.slice(0, 3);
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}