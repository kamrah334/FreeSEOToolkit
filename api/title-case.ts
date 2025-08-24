import { VercelRequest, VercelResponse } from '@vercel/node';

interface TitleCaseResponse {
  original: string;
  converted: string;
  rulesApplied: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
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