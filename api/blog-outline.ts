import { VercelRequest, VercelResponse } from '@vercel/node';

interface BlogOutlineResponse {
  title: string;
  sections: Array<{
    heading: string;
    level: number;
    subsections?: string[];
  }>;
  estimatedWordCount: number;
  estimatedReadingTime: number;
}

// Professional blog outline generator
function generateBlogOutline(topic: string, audience?: string, length: string = 'medium') {
  const cleanTopic = topic.trim();
  const mainKeywords = extractKeywords(cleanTopic);
  const primaryKeyword = mainKeywords[0] || 'topic';
  
  // Different outline structures based on topic type
  const outlineTemplates = {
    howTo: [
      { heading: "Introduction", level: 2, subsections: [`What is ${cleanTopic}?`, "Why it matters", "What you'll achieve"] },
      { heading: "Getting Started", level: 2, subsections: ["Prerequisites", "Tools you'll need", "Setting expectations"] },
      { heading: "Step-by-Step Process", level: 2, subsections: ["Phase 1: Foundation", "Phase 2: Implementation", "Phase 3: Optimization"] },
      { heading: "Best Practices", level: 2, subsections: ["Pro tips from experts", "Common mistakes to avoid", "Time-saving shortcuts"] },
      { heading: "Advanced Strategies", level: 2, subsections: ["Next-level techniques", "Scaling your efforts", "Measuring success"] },
      { heading: "Troubleshooting", level: 2, subsections: ["Common issues", "Quick fixes", "When to seek help"] },
      { heading: "Conclusion", level: 2, subsections: ["Key takeaways", "Your next steps", "Additional resources"] }
    ],
    guide: [
      { heading: "Introduction", level: 2, subsections: [`Understanding ${primaryKeyword}`, "Why this guide exists", "Who this is for"] },
      { heading: "The Fundamentals", level: 2, subsections: ["Core concepts explained", "Essential terminology", "Building your foundation"] },
      { heading: "Practical Application", level: 2, subsections: ["Real-world examples", "Case studies", "Hands-on exercises"] },
      { heading: "Advanced Concepts", level: 2, subsections: ["Complex scenarios", "Expert-level insights", "Industry secrets"] },
      { heading: "Implementation Strategy", level: 2, subsections: ["Planning your approach", "Timeline and milestones", "Resource allocation"] },
      { heading: "Measuring Results", level: 2, subsections: ["Key metrics to track", "Analysis techniques", "Continuous improvement"] },
      { heading: "Conclusion", level: 2, subsections: ["Putting it all together", "Long-term strategy", "Where to go next"] }
    ],
    comparison: [
      { heading: "Introduction", level: 2, subsections: ["Setting the stage", "What we're comparing", "Why it matters"] },
      { heading: "Overview of Options", level: 2, subsections: ["Option A breakdown", "Option B breakdown", "Key differences"] },
      { heading: "Detailed Analysis", level: 2, subsections: ["Performance comparison", "Cost analysis", "User experience"] },
      { heading: "Pros and Cons", level: 2, subsections: ["Advantages of each", "Potential drawbacks", "Deal-breakers to consider"] },
      { heading: "Use Cases", level: 2, subsections: ["When to choose A", "When to choose B", "Hybrid approaches"] },
      { heading: "Final Recommendation", level: 2, subsections: ["Our verdict", "Decision framework", "Making your choice"] }
    ]
  };
  
  // Determine outline type based on topic keywords
  let selectedTemplate = outlineTemplates.guide; // default
  
  if (cleanTopic.toLowerCase().includes('how to') || cleanTopic.toLowerCase().includes('step by step')) {
    selectedTemplate = outlineTemplates.howTo;
  } else if (cleanTopic.toLowerCase().includes('vs') || cleanTopic.toLowerCase().includes('versus') || cleanTopic.toLowerCase().includes('comparison')) {
    selectedTemplate = outlineTemplates.comparison;
  }
  
  // Adjust length
  let sections = [...selectedTemplate];
  if (length === 'short') {
    sections = sections.slice(0, 4);
  } else if (length === 'long') {
    // Add more detailed subsections for long content
    sections = sections.map(section => ({
      ...section,
      subsections: [...section.subsections, `Additional insights on ${section.heading.toLowerCase()}`]
    }));
  }
  
  // Customize based on audience
  if (audience) {
    sections = customizeForAudience(sections, audience, cleanTopic);
  }
  
  return sections;
}

function extractKeywords(topic: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'where', 'when', 'why', 'complete', 'guide', 'ultimate']);
  return topic.toLowerCase().split(/\s+/).filter(word => !stopWords.has(word) && word.length > 2);
}

function customizeForAudience(sections: any[], audience: string, topic: string) {
  const audienceAdjustments = {
    'beginners': {
      addSections: [{ heading: "Getting Started - A Beginner's Perspective", level: 2, subsections: ["Basic concepts explained simply", "What you need to know first", "Building confidence"] }],
      modifyIntro: "New to this? Don't worry - we'll start from the very beginning."
    },
    'business-owners': {
      addSections: [{ heading: "Business Impact and ROI", level: 2, subsections: ["Cost-benefit analysis", "Revenue implications", "Resource requirements"] }],
      modifyIntro: "How this affects your bottom line and business growth."
    },
    'marketers': {
      addSections: [{ heading: "Marketing Applications", level: 2, subsections: ["Campaign integration", "Audience targeting", "Performance tracking"] }],
      modifyIntro: "Leveraging this for better marketing outcomes."
    }
  };
  
  const adjustments = audienceAdjustments[audience as keyof typeof audienceAdjustments];
  if (adjustments) {
    // Insert audience-specific section after introduction
    sections.splice(1, 0, ...adjustments.addSections);
  }
  
  return sections;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { topic, audience, length } = req.body;
    
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const validatedLength = length && ['short', 'medium', 'long'].includes(length) ? length : 'medium';
    
    // Generate professional blog outline
    const sections = generateBlogOutline(topic, audience, validatedLength);

    const estimatedWordCount = validatedLength === "short" ? 1200 : 
                              validatedLength === "medium" ? 2500 : 4000;
    const estimatedReadingTime = Math.ceil(estimatedWordCount / 250);

    const response: BlogOutlineResponse = {
      title: topic,
      sections,
      estimatedWordCount,
      estimatedReadingTime,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Blog outline generation error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to generate blog outline" 
    });
  }
}