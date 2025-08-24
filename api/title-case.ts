import { VercelRequest, VercelResponse } from '@vercel/node';
import { titleCaseRequestSchema, type TitleCaseResponse } from "../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = titleCaseRequestSchema.parse(req.body);
    
    const stopWords = new Set([
      'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 
      'is', 'it', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'
    ]);

    const words = text.toLowerCase().split(/\s+/);
    const convertedWords = words.map((word, index) => {
      // Always capitalize first and last word
      if (index === 0 || index === words.length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      
      // Don't capitalize stop words unless they're first/last
      if (stopWords.has(word)) {
        return word;
      }
      
      // Capitalize everything else
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    const converted = convertedWords.join(' ');
    
    const rulesApplied = [
      "Capitalized major words (nouns, verbs, adjectives)",
      "Kept articles lowercase (a, an, the)",
      "Kept prepositions lowercase (for, to, in, of, etc.)",
      "Capitalized first and last words"
    ];

    const response: TitleCaseResponse = {
      original: text,
      converted,
      rulesApplied,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Title case conversion error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to convert title case" 
    });
  }
}