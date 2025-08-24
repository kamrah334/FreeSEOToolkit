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
    let content = generateBlogContent(sections, data.title, data.keywords, data.tone, data.targetWords);
    
    // Apply human-like enhancements
    content = addHumanTouches(content);
    
    const seoScore = calculateSEOScore(content, data.keywords);
    const metaDescription = generateMetaDescription(data.title, data.keywords);
    const suggestedTags = generateSuggestedTags(data.title, data.keywords);
    const humanSeoTips = generateHumanSeoTips();
    
    const result = {
      title: data.title,
      content,
      seoScore,
      metaDescription,
      suggestedTags,
      seoTips: humanSeoTips,
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
  
  const personalStories = [
    `You know, I still remember the first time I encountered ${keywordText}. I was sitting in my office at 2 AM (don't ask why – we've all been there), and I suddenly realized I had no idea what I was doing. Sound familiar? That moment changed everything for me.`,
    `Let me be honest with you – ${keywordText} used to intimidate the heck out of me. I'd see other people talking about it like it was second nature, while I'm over here googling the basics. But here's the thing that nobody tells you...`,
    `So there I was, three cups of coffee deep, trying to figure out ${keywordText}. My colleague walked by and said something that completely changed my perspective. "Why are you making this so complicated?" she asked. Good question.`,
    `I'll never forget the day when ${keywordText} finally "clicked" for me. I was actually helping my neighbor with something completely unrelated when the connection hit me. Sometimes the best insights come when you're not even trying, right?`
  ];

  const personalReflections = [
    `\n\nLook, I'm not going to pretend I figured this out overnight. I made plenty of mistakes – some embarrassing ones, actually. But those mistakes taught me more than any textbook ever could. And honestly? You're probably going to make some of the same mistakes. That's totally normal.`,
    `\n\nWhat I'm sharing here isn't from some ivory tower perspective. This comes from real trial and error, late nights fixing problems, and that "aha!" moment when everything suddenly makes sense. I wish someone had laid it out for me this way when I was starting.`,
    `\n\nHere's what I've learned after stumbling through this myself: ${keywordText} doesn't have to be overwhelming. Yes, there are nuances. Yes, it takes practice. But the fundamental concepts? They're actually pretty straightforward once someone explains them without all the jargon.`,
    `\n\nI remember feeling completely lost when I started with this stuff. Everyone seemed to know what they were talking about except me. But you know what? Most of them were just better at hiding their confusion. The truth is, we all start somewhere, and there's no shame in being at the beginning.`
  ];

  const randomStory = personalStories[Math.floor(Math.random() * personalStories.length)];
  const randomReflection = personalReflections[Math.floor(Math.random() * personalReflections.length)];
  
  return randomStory + randomReflection;
}

function generateConclusion(title: string, keywords?: string, tone = 'professional', targetWords = 150): string {
  const keywordText = keywords ? keywords.split(',')[0].trim() : title.split(' ')[0];
  
  const personalClosings = [
    `Okay, so we've covered a lot of ground here. Is your head spinning a little? Mine was too when I first started piecing this together. ${keywordText} seemed like this mysterious thing that only "experts" understood. Spoiler alert: we're all just figuring it out as we go.`,
    `I'll be real with you – when I started writing this, I thought it would be a quick overview. But once I got going, I realized there's so much I wanted to share with you. That's the thing about ${keywordText} – the more you learn, the more you realize how much there is to explore.`,
    `You made it to the end! Seriously though, I know there's a lot of information here. Don't feel like you need to absorb it all at once. I still go back to reference materials I wrote years ago because, let's face it, nobody remembers everything.`,
    `So here we are at the end of our little journey together. If you're feeling a bit overwhelmed, that's completely normal. I remember printing out articles like this (yes, I'm that old) and highlighting everything in sight. The key is not to panic about all the details.`
  ];
  
  const encouragingAdvice = [
    `\n\nHere's my honest advice: pick one thing. Just one. Something that resonated with you while reading this. Try it out for a week. Don't worry about being perfect – I certainly wasn't when I started. The goal is progress, not perfection. And hey, if it doesn't work out exactly as planned, that's data too.`,
    `\n\nLook, I could give you the standard "take action now" advice, but we both know that's easier said than done. Instead, I'll tell you what I tell my friends: start small, be patient with yourself, and don't compare your beginning to someone else's middle. We all move at our own pace.`,
    `\n\nI'm curious to know how this goes for you. Seriously. Every person I've shared these ideas with has had a slightly different experience, and I learn something new each time. Don't be a stranger if you have questions or want to share your results – the good, the bad, and the "what the heck just happened."`,
    `\n\nRemember, this isn't a race. I'm still learning new things about ${keywordText} all the time, and I've been at this for years. The fact that you made it through this entire article tells me you're serious about improving, and that's honestly the most important part. The rest is just practice.`
  ];
  
  const randomClosing = personalClosings[Math.floor(Math.random() * personalClosings.length)];
  const randomAdvice = encouragingAdvice[Math.floor(Math.random() * encouragingAdvice.length)];
  
  return randomClosing + randomAdvice;
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