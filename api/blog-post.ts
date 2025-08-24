import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const BlogPostSchema = z.object({
  title: z.string().min(10).max(200),
  keywords: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'technical', 'friendly']).default('professional'),
  targetWords: z.number().min(300).max(3000).default(800),
  includeIntro: z.boolean().default(true),
  includeConclusion: z.boolean().default(true),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = BlogPostSchema.parse(req.body);
    
    const sections = createBlogStructure(data.title, data.tone, data.includeIntro, data.includeConclusion);
    const content = generateBlogContent(sections, data.title, data.keywords, data.tone, data.targetWords);
    const seoScore = calculateSEOScore(content, data.keywords);
    const metaDescription = generateMetaDescription(data.title, data.keywords);
    const suggestedTags = generateSuggestedTags(data.title, data.keywords);
    
    const result = {
      title: data.title,
      content,
      seoScore,
      metaDescription,
      suggestedTags,
      wordCount: content.split(' ').length,
      readingTime: Math.ceil(content.split(' ').length / 200),
    };

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

function createBlogStructure(title: string, tone: string, includeIntro: boolean, includeConclusion: boolean) {
  const structure: Array<{ heading: string; level: number }> = [];
  
  if (includeIntro) {
    structure.push({ heading: "Introduction", level: 2 });
  }

  // Add main content sections based on title
  const mainSections = [
    "Understanding the Fundamentals",
    "Key Strategies and Best Practices", 
    "Common Challenges and Solutions",
    "Advanced Tips and Techniques",
    "Real-World Applications"
  ];
  
  mainSections.slice(0, 3).forEach(section => {
    structure.push({ heading: section, level: 2 });
  });

  if (includeConclusion) {
    structure.push({ heading: "Conclusion", level: 2 });
  }

  return structure;
}

function generateBlogContent(structure: any[], title: string, keywords?: string, tone = 'professional', targetWords = 800) {
  const wordsPerSection = Math.floor(targetWords / structure.length);
  let content = '';

  structure.forEach((section) => {
    content += `## ${section.heading}\n\n`;
    
    if (section.heading.toLowerCase().includes('introduction')) {
      content += generateIntroduction(title, keywords, tone, wordsPerSection);
    } else if (section.heading.toLowerCase().includes('conclusion')) {
      content += generateConclusion(title, keywords, tone, wordsPerSection);
    } else {
      content += generateSectionContent(section.heading, keywords, tone, wordsPerSection);
    }
    
    content += '\n\n';
  });

  return content.trim();
}

function generateIntroduction(title: string, keywords?: string, tone = 'professional', targetWords = 150): string {
  const keywordText = keywords ? keywords.split(',')[0].trim() : title.split(' ')[0];
  
  const intros = [
    `I've been working with ${keywordText} for quite some time now, and I can tell you it's one of those topics that really makes a difference. When I first started exploring ${title.toLowerCase()}, I wasn't sure what to expect.`,
    `Let me share something with you about ${keywordText}. Over the years, I've noticed that most people either overcomplicate it or don't give it the attention it deserves. The truth is, ${keywordText} can transform your approach if you understand it properly.`,
    `Have you ever wondered why some people seem to excel at ${keywordText} while others struggle? After working in this field and helping countless individuals, I've identified the key factors that make all the difference.`,
    `Here's what I wish someone had told me when I was starting with ${keywordText}. It's not as complicated as it might seem, but there are definitely some important things you need to know.`
  ];
  
  const followUps = [
    `\n\nWhat I'm going to share with you in this guide comes from real experience – both my successes and mistakes. I'll walk you through each step, explain why certain approaches work better than others, and give you practical examples you can use right away.`,
    `\n\nThroughout this article, I'll be sharing insights that come from hands-on experience. These aren't just theoretical concepts – they're strategies that have proven to work time and again. By the time you finish reading, you'll have a solid roadmap to follow.`,
    `\n\nI believe in keeping things practical and straightforward. That's why everything I'll cover here is based on real-world applications and proven methods. You won't find any fluff or overly complex theories – just actionable advice you can start using today.`
  ];
  
  return intros[Math.floor(Math.random() * intros.length)] + followUps[Math.floor(Math.random() * followUps.length)];
}

function generateConclusion(title: string, keywords?: string, tone = 'professional', targetWords = 150): string {
  const keywordText = keywords ? keywords.split(',')[0].trim() : title.split(' ')[0];
  
  const conclusions = [
    `Looking back at everything we've covered, ${keywordText} really isn't as intimidating as it might have seemed at first. The key is to start with the basics and build from there. Don't try to implement everything at once – that's a recipe for overwhelm.`,
    `I hope this guide has given you a clearer picture of how ${keywordText} works and why it matters. From my experience, the people who succeed are those who take consistent action, even if it's just small steps at first.`,
    `As we wrap this up, remember that becoming proficient with ${keywordText} is a journey, not a destination. I'm still learning new things about it regularly, and that's part of what makes it interesting.`
  ];
  
  const actionCalls = [
    `\n\nHere's what I'd suggest as your next steps: pick one or two strategies from what we've discussed and focus on those first. Once you're comfortable with them, you can gradually add more techniques to your toolkit. And don't be afraid to experiment – some of my best discoveries came from trying things that weren't in any textbook.`,
    `\n\nIf you take away just one thing from this article, let it be this: consistency beats perfection every time. It's better to apply these concepts imperfectly on a regular basis than to wait for the perfect moment that never comes. Start where you are, use what you have, and do what you can.`,
    `\n\nI'd love to hear about your experiences as you start implementing these ideas. Everyone's situation is different, and what works perfectly for one person might need tweaking for another. That's normal and expected – the important thing is to get started.`
  ];
  
  return conclusions[Math.floor(Math.random() * conclusions.length)] + actionCalls[Math.floor(Math.random() * actionCalls.length)];
}

function generateSectionContent(heading: string, keywords?: string, tone = 'professional', targetWords = 200): string {
  const keywordText = keywords ? keywords.split(',')[0].trim() : heading.split(' ')[0];
  
  const templates = [
    `Now, let's talk about ${heading.toLowerCase()}. This is where things get interesting, and honestly, it's something I see people struggle with more often than they should.\n\nWhat I've learned over the years is that ${keywordText} isn't just about following a set formula. Sure, there are best practices, but the real magic happens when you understand the why behind what you're doing.\n\nHere's what has worked well for me:\n\n• Start with the fundamentals, but don't be afraid to adapt them to your specific situation\n• Pay attention to what your audience actually responds to, not just what the experts say\n• Test different approaches and keep track of what works\n• Be patient with the process – good results take time to develop\n\nOne thing I always tell people is that there's no substitute for real-world experience. You can read all the guides in the world, but until you actually start implementing and seeing what happens, you won't truly understand how it all fits together.`,
    
    `${heading} is one of those areas where I see a lot of confusion. People often overthink it or, on the flip side, don't give it enough attention. Let me break down what actually matters.\n\nFirst off, ${keywordText} isn't as complicated as some make it out to be. But it does require a thoughtful approach. I've made my share of mistakes here, and each one taught me something valuable.\n\nWhat I wish I'd known earlier:\n\n• Quality always beats quantity – it's better to do fewer things well\n• Consistency matters more than perfection\n• Your approach should evolve as you learn and grow\n• Don't ignore feedback, even when it's uncomfortable\n\nThe biggest game-changer for me was realizing that ${keywordText} works best when it feels natural and authentic. When you try to force it or follow someone else's formula exactly, it usually shows.`,
    
    `Here's something I've noticed about ${heading.toLowerCase()}: most people either go all-in from day one and burn out, or they never really give it a proper chance. The sweet spot is somewhere in between.\n\nWhen I first encountered ${keywordText}, I made the mistake of trying to do everything at once. It was overwhelming and, frankly, not very effective. Now I take a more measured approach.\n\nMy current strategy looks like this:\n\n• Pick one or two key areas to focus on initially\n• Spend time understanding the fundamentals before moving to advanced techniques\n• Keep detailed notes on what works and what doesn't\n• Regularly review and adjust my approach based on results\n• Connect with others who are on a similar journey\n\nWhat's really helped me is treating this as an ongoing learning process rather than something to master once and forget about. The landscape keeps evolving, and staying curious has served me well.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function calculateSEOScore(content: string, keywords?: string): {
  overall: number;
  breakdown: {
    length: { score: number; feedback: string };
    keywords: { score: number; feedback: string };
    headers: { score: number; feedback: string };
    paragraphs: { score: number; feedback: string };
  };
} {
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const headers = (content.match(/^#+\s/gm) || []).length;
  const paragraphs = content.split('\n\n').length;

  // Length score (600-2000 words is ideal)
  const lengthScore = wordCount >= 600 && wordCount <= 2000 ? 100 :
                     wordCount >= 300 && wordCount < 600 ? 70 :
                     wordCount > 2000 && wordCount <= 3000 ? 80 : 50;

  // Keywords score
  let keywordScore = 50;
  let keywordFeedback = 'No target keywords specified';
  if (keywords) {
    const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
    const contentLower = content.toLowerCase();
    const totalDensity = keywordList.reduce((acc, keyword) => {
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      return acc + (matches / wordCount) * 100;
    }, 0);
    
    keywordScore = totalDensity >= 1 && totalDensity <= 3 ? 100 :
                   totalDensity >= 0.5 && totalDensity < 1 ? 80 :
                   totalDensity > 3 && totalDensity <= 5 ? 70 : 50;
    keywordFeedback = `Keyword density: ${totalDensity.toFixed(2)}% ${
      totalDensity >= 1 && totalDensity <= 3 ? '(Perfect)' :
      totalDensity < 1 ? '(Too low)' : '(Too high)'
    }`;
  }

  // Headers score (should have proper H2/H3 structure)
  const headerScore = headers >= 3 && headers <= 8 ? 100 :
                     headers >= 2 && headers < 3 ? 80 :
                     headers > 8 && headers <= 12 ? 70 : 50;

  // Paragraph score (readability)
  const avgWordsPerParagraph = wordCount / paragraphs;
  const paragraphScore = avgWordsPerParagraph >= 50 && avgWordsPerParagraph <= 150 ? 100 :
                        avgWordsPerParagraph >= 30 && avgWordsPerParagraph < 50 ? 80 :
                        avgWordsPerParagraph > 150 && avgWordsPerParagraph <= 200 ? 80 : 60;

  const overall = Math.round((lengthScore + keywordScore + headerScore + paragraphScore) / 4);

  return {
    overall,
    breakdown: {
      length: {
        score: lengthScore,
        feedback: `${wordCount} words ${
          wordCount >= 600 && wordCount <= 2000 ? '(Ideal length)' :
          wordCount < 600 ? '(Consider adding more content)' :
          '(Consider condensing for better readability)'
        }`
      },
      keywords: {
        score: keywordScore,
        feedback: keywordFeedback
      },
      headers: {
        score: headerScore,
        feedback: `${headers} headers ${
          headers >= 3 && headers <= 8 ? '(Good structure)' :
          headers < 3 ? '(Add more subheadings)' :
          '(Consider consolidating some headers)'
        }`
      },
      paragraphs: {
        score: paragraphScore,
        feedback: `Avg ${Math.round(avgWordsPerParagraph)} words per paragraph ${
          avgWordsPerParagraph >= 50 && avgWordsPerParagraph <= 150 ? '(Good readability)' :
          avgWordsPerParagraph < 50 ? '(Consider longer paragraphs)' :
          '(Consider shorter paragraphs for better readability)'
        }`
      }
    }
  };
}

function generateMetaDescription(title: string, keywords?: string): string {
  const keywordText = keywords ? keywords.split(',')[0].trim() : title.split(' ')[0];
  const templates = [
    `Learn everything about ${title.toLowerCase()} with our comprehensive guide. Discover proven strategies, expert tips, and practical insights for ${keywordText} success.`,
    `Master ${keywordText} with our detailed guide on ${title.toLowerCase()}. Get actionable advice, best practices, and real-world examples.`,
    `Complete guide to ${title.toLowerCase()}. Learn ${keywordText} fundamentals, advanced techniques, and proven strategies for better results.`
  ];
  
  const description = templates[Math.floor(Math.random() * templates.length)];
  return description.length > 160 ? description.substring(0, 157) + '...' : description;
}

function generateSuggestedTags(title: string, keywords?: string): string[] {
  const keywordText = keywords ? keywords.split(',')[0].trim() : title.split(' ')[0];
  const baseTags = [keywordText, 'tips', 'guide', 'best practices', 'strategies'];
  
  const additionalTags = [
    'tutorial', 'how-to', 'beginners', 'advanced', 'expert advice',
    'step-by-step', 'complete guide', 'ultimate guide', 'practical',
    'effective methods', 'proven techniques', 'success tips'
  ];
  
  const shuffledAdditional = additionalTags.sort(() => Math.random() - 0.5);
  return [...baseTags, ...shuffledAdditional.slice(0, 3)];
}