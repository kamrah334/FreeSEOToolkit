import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const ArticleSchema = z.object({
  topic: z.string().min(5).max(200),
  style: z.enum(['how-to', 'listicle', 'news', 'opinion', 'research']).default('how-to'),
  targetWords: z.number().min(500).max(5000).default(1200),
  audience: z.enum(['beginner', 'intermediate', 'advanced', 'general']).default('general'),
  includeIntro: z.boolean().default(true),
  includeConclusion: z.boolean().default(true),
  keywords: z.string().optional(),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = ArticleSchema.parse(req.body);
    
    const title = generateArticleTitle(data.topic, data.style, data.keywords);
    const structure = createArticleStructure(data.topic, data.style, data.includeIntro, data.includeConclusion);
    let content = generateArticleContent(structure, data.topic, data.keywords, data.style, data.targetWords, data.audience);
    
    // Apply human-like enhancements
    content = addHumanTouches(content);
    
    const seoScore = calculateSEOScore(content, data.keywords);
    const metaDescription = generateMetaDescription(title, data.keywords);
    const suggestedTags = generateSuggestedTags(data.topic, data.keywords, data.style);
    const humanSeoTips = generateHumanSeoTips();
    
    const result = {
      title,
      content,
      seoScore,
      metaDescription,
      suggestedTags,
      seoTips: humanSeoTips,
      structure,
      wordCount: content.split(' ').length,
      readingTime: Math.ceil(content.split(' ').length / 200),
      style: data.style,
      audience: data.audience,
    };

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

function createArticleStructure(topic: string, style: string, includeIntro: boolean, includeConclusion: boolean) {
  const structure: Array<{ heading: string; level: number }> = [];
  
  if (includeIntro) {
    structure.push({ heading: "Introduction", level: 2 });
  }

  switch (style) {
    case 'how-to':
      structure.push(
        { heading: "What You'll Need", level: 2 },
        { heading: "Step-by-Step Guide", level: 2 },
        { heading: "Tips for Success", level: 2 },
        { heading: "Common Mistakes to Avoid", level: 2 }
      );
      break;
    case 'listicle':
      for (let i = 1; i <= 7; i++) {
        structure.push({ heading: `${i}. Key Point About ${topic}`, level: 2 });
      }
      break;
    case 'news':
      structure.push(
        { heading: "Key Details", level: 2 },
        { heading: "Impact and Implications", level: 2 },
        { heading: "What This Means for You", level: 2 }
      );
      break;
    case 'opinion':
      structure.push(
        { heading: "The Current Situation", level: 2 },
        { heading: "Why This Matters", level: 2 },
        { heading: "My Perspective", level: 2 },
        { heading: "Looking Forward", level: 2 }
      );
      break;
    case 'research':
      structure.push(
        { heading: "Background", level: 2 },
        { heading: "Key Findings", level: 2 },
        { heading: "Analysis", level: 2 },
        { heading: "Implications", level: 2 }
      );
      break;
  }

  if (includeConclusion) {
    structure.push({ heading: "Conclusion", level: 2 });
  }

  return structure;
}

function generateArticleTitle(topic: string, style: string, keywords?: string): string {
  const keywordText = keywords ? keywords.split(',')[0].trim() : topic;
  
  switch (style) {
    case 'how-to':
      return `How to Master ${topic}: Complete Guide for ${new Date().getFullYear()}`;
    case 'listicle':
      return `7 Essential Things You Need to Know About ${topic}`;
    case 'news':
      return `Breaking: Latest Developments in ${topic}`;
    case 'opinion':
      return `Why ${topic} is More Important Than Ever`;
    case 'research':
      return `Comprehensive Analysis: The State of ${topic}`;
    default:
      return `Complete Guide to ${topic}`;
  }
}

function generateArticleContent(structure: any[], topic: string, keywords?: string, style = 'how-to', targetWords = 1200, audience?: string): string {
  const wordsPerSection = Math.floor(targetWords / structure.length);
  let content = '';

  structure.forEach((section) => {
    content += `## ${section.heading}\n\n`;
    
    if (section.heading.toLowerCase().includes('introduction')) {
      content += generateIntroduction(topic, keywords, 'professional', wordsPerSection);
    } else if (section.heading.toLowerCase().includes('conclusion')) {
      content += generateConclusion(topic, keywords, 'professional', wordsPerSection);
    } else {
      content += generateSectionContent(section.heading, keywords, 'professional', wordsPerSection);
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

// Anti-AI detection enhancements
function addHumanTouches(content: string): string {
  const imperfections = [
    { original: /However,/g, replacement: Math.random() > 0.5 ? 'However,' : 'But,' },
    { original: /Additionally,/g, replacement: Math.random() > 0.5 ? 'Also,' : 'Plus,' },
    { original: /Furthermore,/g, replacement: Math.random() > 0.5 ? 'What\'s more,' : 'On top of that,' },
  ];

  let humanizedContent = content;
  
  // Add conversational elements
  const conversationalInserts = [
    'You know what I mean?',
    'Make sense?',
    '(Trust me on this one)',
    'Here\'s the kicker:',
    'Plot twist:',
    '(I learned this the hard way)',
    'Between you and me,',
    'Real talk:'
  ];

  // Randomly insert conversational elements
  const sentences = humanizedContent.split('. ');
  for (let i = 0; i < sentences.length; i++) {
    if (Math.random() > 0.85 && i > 0 && i < sentences.length - 1) { // 15% chance
      const insert = conversationalInserts[Math.floor(Math.random() * conversationalInserts.length)];
      sentences[i] = sentences[i] + ' ' + insert;
    }
  }
  
  humanizedContent = sentences.join('. ');
  
  // Apply imperfections
  imperfections.forEach(imp => {
    if (Math.random() > 0.7) { // 30% chance to apply each imperfection
      humanizedContent = humanizedContent.replace(imp.original, imp.replacement);
    }
  });

  return humanizedContent;
}

function generateHumanSeoTips(): string[] {
  const tips = [
    'Your content feels authentic and conversational - that\'s what readers love!',
    'The personal anecdotes make this way more engaging than typical articles.',
    'Great job mixing professional insights with relatable experiences.',
    'This has that friend explaining something type vibe - perfect for engagement!',
    'The casual tone makes complex topics feel approachable and trustworthy.',
    'Love how you\'ve avoided jargon-heavy language - keeps readers hooked.',
    'The personal stories add credibility and make the content memorable.',
    'Your writing style feels natural and unforced - exactly what Google rewards.',
    'The conversational approach helps build reader trust and authority.',
    'Great balance of expertise and relatability throughout the content.'
  ];
  
  // Return 2-3 random tips
  const shuffled = tips.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
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

  // Length score (800-3000 words is ideal for articles)
  const lengthScore = wordCount >= 800 && wordCount <= 3000 ? 100 :
                     wordCount >= 500 && wordCount < 800 ? 70 :
                     wordCount > 3000 && wordCount <= 5000 ? 80 : 50;

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

  // Headers score (articles should have good structure)
  const headerScore = headers >= 4 && headers <= 12 ? 100 :
                     headers >= 3 && headers < 4 ? 80 :
                     headers > 12 && headers <= 15 ? 70 : 50;

  // Paragraph score (readability for longer content)
  const avgWordsPerParagraph = wordCount / paragraphs;
  const paragraphScore = avgWordsPerParagraph >= 60 && avgWordsPerParagraph <= 180 ? 100 :
                        avgWordsPerParagraph >= 40 && avgWordsPerParagraph < 60 ? 80 :
                        avgWordsPerParagraph > 180 && avgWordsPerParagraph <= 250 ? 80 : 60;

  const overall = Math.round((lengthScore + keywordScore + headerScore + paragraphScore) / 4);

  return {
    overall,
    breakdown: {
      length: {
        score: lengthScore,
        feedback: `${wordCount} words ${
          wordCount >= 800 && wordCount <= 3000 ? '(Ideal length)' :
          wordCount < 800 ? '(Consider adding more content)' :
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
          headers >= 4 && headers <= 12 ? '(Good structure)' :
          headers < 4 ? '(Add more subheadings)' :
          '(Consider consolidating some headers)'
        }`
      },
      paragraphs: {
        score: paragraphScore,
        feedback: `Avg ${Math.round(avgWordsPerParagraph)} words per paragraph ${
          avgWordsPerParagraph >= 60 && avgWordsPerParagraph <= 180 ? '(Good readability)' :
          avgWordsPerParagraph < 60 ? '(Consider longer paragraphs)' :
          '(Consider shorter paragraphs for better readability)'
        }`
      }
    }
  };
}

function generateMetaDescription(title: string, keywords?: string): string {
  const keywordText = keywords ? keywords.split(',')[0].trim() : title.split(' ')[0];
  const templates = [
    `Comprehensive guide on ${title.toLowerCase()}. Learn proven strategies, expert insights, and practical tips for ${keywordText} success.`,
    `Everything you need to know about ${title.toLowerCase()}. Discover best practices, advanced techniques, and real-world applications for ${keywordText}.`,
    `Master ${keywordText} with our detailed analysis of ${title.toLowerCase()}. Expert advice, actionable strategies, and proven methods.`
  ];
  
  const description = templates[Math.floor(Math.random() * templates.length)];
  return description.length > 160 ? description.substring(0, 157) + '...' : description;
}

function generateSuggestedTags(topic: string, keywords?: string, style?: string): string[] {
  const keywordText = keywords ? keywords.split(',')[0].trim() : topic.split(' ')[0];
  const baseTags = [keywordText, 'analysis', 'guide', 'insights'];
  
  const styleBasedTags = {
    'how-to': ['tutorial', 'step-by-step', 'practical', 'instructions'],
    'listicle': ['list', 'tips', 'best practices', 'top picks'],
    'news': ['breaking', 'latest', 'updates', 'current'],
    'opinion': ['perspective', 'thoughts', 'commentary', 'viewpoint'],
    'research': ['study', 'analysis', 'findings', 'data']
  };
  
  const styleTags = style ? styleBasedTags[style as keyof typeof styleBasedTags] || [] : [];
  const additionalTags = ['expert advice', 'comprehensive', 'detailed', 'professional'];
  
  return [...baseTags, ...styleTags.slice(0, 2), ...additionalTags.slice(0, 2)];
}