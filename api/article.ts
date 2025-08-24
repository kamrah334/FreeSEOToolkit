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
  
  const personalStarters = [
    `Honestly? I used to think ${keywordText} was way more complicated than it actually is.`,
    `Three years ago, I was completely lost when it came to ${keywordText}. Now I'm here writing about it – funny how things change, right?`,
    `So here's the thing about ${title.toLowerCase()} that nobody really talks about...`,
    `I'll be straight with you – when I first heard about ${keywordText}, I was skeptical.`,
    `Let me tell you about the time I completely messed up with ${keywordText}. It taught me everything I know now.`,
    `You know that feeling when you finally "get" something? That's exactly what happened to me with ${keywordText}.`
  ];
  
  const conversationalBridges = [
    `\n\nBut here's what changed my mind. After spending way too many late nights figuring this stuff out (my coffee addiction can confirm), I realized ${keywordText} isn't the monster everyone makes it out to be.`,
    `\n\nTurns out, most of what you hear about ${keywordText} is either outdated or just plain wrong. I wish someone had sat me down and explained it the way I'm about to explain it to you.`,
    `\n\nWhat I'm about to share isn't from some textbook or corporate training. This comes from actually doing it, failing at it, and eventually figuring out what works (and what definitely doesn't).`,
    `\n\nLook, I could give you the standard corporate explanation, but that's not why you're here. You want the real deal – the stuff that actually works when you're in the trenches.`
  ];
  
  const conclusionHooks = [
    `\n\nBy the end of this, you'll not only understand ${keywordText}, but you'll also have a clear action plan that you can start implementing today. No fluff, no theory – just practical steps that get results.`,
    `\n\nI'm going to walk you through exactly what I learned, including the mistakes you can avoid and the shortcuts that actually save time. Ready? Let's dive in.`,
    `\n\nStick with me here, and I'll show you how to approach ${keywordText} in a way that actually makes sense. Plus, I'll share the one mistake that trips up 90% of people (and how to avoid it).`
  ];
  
  return personalStarters[Math.floor(Math.random() * personalStarters.length)] + 
         conversationalBridges[Math.floor(Math.random() * conversationalBridges.length)] +
         conclusionHooks[Math.floor(Math.random() * conclusionHooks.length)];
}

function generateConclusion(title: string, keywords?: string, tone = 'professional', targetWords = 150): string {
  const keywordText = keywords ? keywords.split(',')[0].trim() : title.split(' ')[0];
  
  const personalClosings = [
    `Alright, that's a wrap! If you're feeling a bit overwhelmed right now, don't worry – that's totally normal. When I first started with ${keywordText}, I felt like I was drinking from a fire hose.`,
    `So there you have it – everything I wish I'd known about ${keywordText} when I was starting out. Is it a lot to take in? Absolutely. But is it doable? 100%.`,
    `Look, I'm not going to lie and say ${keywordText} is a walk in the park. But after working with it for years, I can tell you it's definitely worth the effort.`,
    `We've covered a lot of ground here, and honestly, my brain is starting to hurt just thinking about all this ${keywordText} stuff again (kidding, mostly).`
  ];
  
  const encouragingAdvice = [
    `\n\nHere's my honest advice: don't try to do everything at once. Pick the one thing that resonated most with you and start there. I made the mistake of trying to implement everything simultaneously, and it was a disaster. Trust me on this one.`,
    `\n\nRemember, everyone's journey with ${keywordText} is different. What worked for me might need some tweaking for your situation, and that's perfectly fine. The key is to start somewhere and adjust as you go.`,
    `\n\nIf you walk away with just one actionable insight from this whole thing, I'll consider it a win. Sometimes that's all it takes – one small change that leads to bigger improvements down the road.`
  ];
  
  const finalThoughts = [
    `\n\nAnd hey, if you run into any roadblocks along the way, don't stress about it. We've all been there. The learning curve might be steep at first, but it levels out pretty quickly once you get the hang of it.`,
    `\n\nI'm genuinely curious about how this goes for you. Feel free to experiment, make mistakes, and find your own approach. That's honestly the best way to really master ${keywordText}.`,
    `\n\nOne last thing – give yourself permission to mess up. I certainly did (more times than I care to admit), and it's all part of the process. Good luck!`
  ];
  
  return personalClosings[Math.floor(Math.random() * personalClosings.length)] + 
         encouragingAdvice[Math.floor(Math.random() * encouragingAdvice.length)] +
         finalThoughts[Math.floor(Math.random() * finalThoughts.length)];
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