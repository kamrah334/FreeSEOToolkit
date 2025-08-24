import { VercelRequest, VercelResponse } from '@vercel/node';

interface MetaDescriptionResponse {
  content: string;
  length: number;
}

// Professional meta description generator
function generateMetaDescription(title: string, audience?: string, keywords?: string): string {
  const cleanTitle = title.trim();
  const keywordList = keywords ? keywords.split(',').map(k => k.trim()) : [];
  const mainKeyword = keywordList[0] || extractMainKeyword(cleanTitle);
  
  const templates = [
    {
      pattern: `Discover ${mainKeyword} with our comprehensive guide. Learn proven strategies, expert tips, and practical insights for better results.`,
      variation: `Master ${mainKeyword} using our step-by-step approach. Get actionable advice from industry experts and transform your results today.`
    },
    {
      pattern: `Everything you need to know about ${cleanTitle.toLowerCase()}. Expert insights, practical tips, and proven strategies that work.`,
      variation: `Complete guide to ${cleanTitle.toLowerCase()}. Learn from real examples, avoid common mistakes, and get measurable results.`
    },
    {
      pattern: `${cleanTitle} made simple. Get practical advice, proven techniques, and expert insights to achieve your goals faster.`,
      variation: `Unlock the secrets of ${cleanTitle.toLowerCase()}. Professional strategies, real-world examples, and actionable steps included.`
    }
  ];
  
  // Add audience-specific elements
  const audienceModifiers = {
    'beginners': 'Perfect for newcomers and those just getting started.',
    'advanced': 'Advanced strategies for experienced professionals.',
    'business-owners': 'Tailored specifically for business leaders and entrepreneurs.',
    'marketers': 'Essential insights for marketing professionals.',
    'developers': 'Technical guidance for developers and engineers.',
    'students': 'Easy-to-follow guide designed for learners.'
  };
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  const useVariation = Math.random() > 0.5;
  let description = useVariation ? template.variation : template.pattern;
  
  // Add audience modifier if specified
  if (audience && audienceModifiers[audience as keyof typeof audienceModifiers]) {
    description += ` ${audienceModifiers[audience as keyof typeof audienceModifiers]}`;
  }
  
  // Add human touches
  const humanTouches = [
    'Read now and see the difference!',
    'Start your journey today.',
    'Join thousands who\'ve already benefited.',
    'See real results fast.',
    'Transform your approach today.',
    'Get started in minutes.'
  ];
  
  if (description.length < 140) {
    description += ` ${humanTouches[Math.floor(Math.random() * humanTouches.length)]}`;
  }
  
  return description;
}

function extractMainKeyword(title: string): string {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'where', 'when', 'why']);
  const words = title.toLowerCase().split(/\s+/).filter(word => !stopWords.has(word) && word.length > 2);
  return words[0] || 'topic';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { title, audience } = req.body;
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const { keywords: keywordInput } = req.body;
    
    // Generate professional meta description
    const content = generateMetaDescription(title, audience, keywordInput);
    
    // Ensure content is within SEO limits
    const finalContent = content.length > 160 ? content.substring(0, 157) + "..." : content;
    
    const response: MetaDescriptionResponse = {
      content: finalContent,
      length: finalContent.length,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Meta description generation error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to generate meta description" 
    });
  }
}