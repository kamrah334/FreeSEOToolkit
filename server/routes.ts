import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  metaDescriptionRequestSchema,
  titleCaseRequestSchema,
  keywordDensityRequestSchema,
  blogOutlineRequestSchema,
  blogPostRequestSchema,
  articleRequestSchema,
  type MetaDescriptionResponse,
  type TitleCaseResponse,
  type KeywordDensityResponse,
  type BlogOutlineResponse,
  type BlogPostResponse,
  type ArticleResponse
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || process.env.HF_API_KEY || "";

  // Professional content generation functions
  function generateProfessionalOutline(topic: string, audience?: string, length: string = 'medium') {
    const cleanTopic = topic.trim();
    const mainKeywords = extractKeywords(cleanTopic);
    const primaryKeyword = mainKeywords[0] || 'topic';
    
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
      ]
    };
    
    let selectedTemplate = outlineTemplates.guide;
    if (cleanTopic.toLowerCase().includes('how to') || cleanTopic.toLowerCase().includes('step by step')) {
      selectedTemplate = outlineTemplates.howTo;
    }
    
    let sections = [...selectedTemplate];
    if (length === 'short') {
      sections = sections.slice(0, 4);
    } else if (length === 'long') {
      sections = sections.map(section => ({
        ...section,
        subsections: [...section.subsections, `Advanced insights on ${section.heading.toLowerCase()}`]
      }));
    }
    
    return sections;
  }

  function extractKeywords(topic: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'where', 'when', 'why', 'complete', 'guide', 'ultimate']);
    return topic.toLowerCase().split(/\s+/).filter(word => !stopWords.has(word) && word.length > 2);
  }

  function generateProfessionalMetaDescription(title: string, keywords?: string): string {
    const cleanTitle = title.trim();
    const keywordList = keywords ? keywords.split(',').map(k => k.trim()) : [];
    const mainKeyword = keywordList[0] || extractKeywords(cleanTitle)[0] || 'topic';
    
    const templates = [
      `Discover ${mainKeyword} with our comprehensive guide. Learn proven strategies, expert tips, and practical insights for better results.`,
      `Everything you need to know about ${cleanTitle.toLowerCase()}. Expert insights, practical tips, and proven strategies that work.`,
      `${cleanTitle} made simple. Get practical advice, proven techniques, and expert insights to achieve your goals faster.`
    ];
    
    const description = templates[Math.floor(Math.random() * templates.length)];
    return description.length > 160 ? description.substring(0, 157) + "..." : description;
  }

  // Meta Description Generator
  app.post("/api/meta-description", async (req, res) => {
    try {
      const { title, audience } = metaDescriptionRequestSchema.parse(req.body);
      const { keywords } = req.body;
      
      // Generate professional meta description
      const content = generateProfessionalMetaDescription(title, keywords);
      
      // Ensure content is within SEO limits
      const finalContent = content.length > 160 ? content.substring(0, 157) + "..." : content;
      
      const response: MetaDescriptionResponse = {
        content: finalContent,
        length: finalContent.length,
      };

      res.json(response);
    } catch (error) {
      console.error("Meta description generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate meta description" 
      });
    }
  });

  // Title Case Converter
  app.post("/api/title-case", async (req, res) => {
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

      res.json(response);
    } catch (error) {
      console.error("Title case conversion error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to convert title case" 
      });
    }
  });

  // Keyword Density Analyzer
  app.post("/api/keyword-density", async (req, res) => {
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

      res.json(response);
    } catch (error) {
      console.error("Keyword density analysis error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze keyword density" 
      });
    }
  });

  // Blog Outline Generator
  app.post("/api/blog-outline", async (req, res) => {
    try {
      const { topic, audience, length } = blogOutlineRequestSchema.parse(req.body);
      
      // Generate professional blog outline
      const sections = generateProfessionalOutline(topic, audience, length);

      const estimatedWordCount = length === "short" ? 1200 : 
                                length === "medium" ? 2500 : 4000;
      const estimatedReadingTime = Math.ceil(estimatedWordCount / 250);

      const response: BlogOutlineResponse = {
        title: topic,
        sections,
        estimatedWordCount,
        estimatedReadingTime,
      };

      res.json(response);
    } catch (error) {
      console.error("Blog outline generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate blog outline" 
      });
    }
  });

  // Helper function to calculate SEO score
  function calculateSEOScore(content: string, title: string, keywords?: string): { score: number, tips: string[] } {
    const tips: string[] = [];
    let score = 0;

    // Check title length
    if (title.length >= 50 && title.length <= 60) {
      score += 15;
    } else {
      tips.push("Title should be 50-60 characters for optimal SEO");
    }

    // Check content length
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 300) {
      score += 20;
    } else {
      tips.push("Content should be at least 300 words for better SEO");
    }

    // Check keyword usage if provided
    if (keywords) {
      const keywordList = keywords.toLowerCase().split(',').map(k => k.trim());
      const contentLower = content.toLowerCase();
      const titleLower = title.toLowerCase();

      let keywordScore = 0;
      keywordList.forEach(keyword => {
        if (titleLower.includes(keyword)) keywordScore += 5;
        if (contentLower.includes(keyword)) keywordScore += 10;
      });
      score += Math.min(keywordScore, 25);

      if (keywordScore === 0) {
        tips.push("Include target keywords in title and content");
      }
    }

    // Check for headers
    const headerCount = (content.match(/^##\s/gm) || []).length;
    if (headerCount >= 3) {
      score += 15;
    } else {
      tips.push("Use at least 3 H2 headers to structure your content");
    }

    // Check paragraph structure
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length >= 4) {
      score += 10;
    } else {
      tips.push("Break content into multiple paragraphs (4+) for better readability");
    }

    // Check for bullet points or lists
    if (content.includes('- ') || content.includes('* ')) {
      score += 10;
    } else {
      tips.push("Use bullet points or lists to improve readability");
    }

    // Check for call-to-action
    const ctaWords = ['learn', 'discover', 'get started', 'try', 'download', 'contact', 'subscribe'];
    if (ctaWords.some(word => content.toLowerCase().includes(word))) {
      score += 5;
    } else {
      tips.push("Include a call-to-action to engage readers");
    }

    return { score: Math.min(score, 100), tips };
  }

  // Helper function to generate tags
  function generateTags(title: string, keywords?: string): string[] {
    const tags = [];
    const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
    tags.push(...titleWords.slice(0, 3));

    if (keywords) {
      const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
      tags.push(...keywordList.slice(0, 2));
    }

    // Remove duplicates and return top 5
    return Array.from(new Set(tags)).slice(0, 5);
  }

  // Blog Post Writer
  app.post("/api/blog-post", async (req, res) => {
    try {
      const { outline, title, targetKeywords, audience, tone, length } = blogPostRequestSchema.parse(req.body);
      
      // Determine word count target
      const wordTargets = { short: 800, medium: 1500, long: 2500 };
      const targetWordCount = wordTargets[length];
      
      // Generate content based on outline or create new structure
      let content = '';
      let structure = [];

      if (outline && outline.sections) {
        // Use provided outline
        structure = outline.sections;
        content = generateBlogContent(outline.sections, title, targetKeywords, tone, targetWordCount);
      } else {
        // Create basic structure
        const topicWords = title.split(' ');
        const mainTopic = topicWords.slice(0, 3).join(' ');
        
        structure = [
          { heading: "Introduction", level: 2 },
          { heading: `Understanding ${mainTopic}`, level: 2 },
          { heading: "Key Benefits and Features", level: 2 },
          { heading: "Best Practices", level: 2 },
          { heading: "Common Mistakes to Avoid", level: 2 },
          { heading: "Conclusion", level: 2 }
        ];
        
        content = generateBlogContent(structure, title, targetKeywords, tone, targetWordCount);
      }

      // Calculate SEO metrics
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 250);
      const { score, tips } = calculateSEOScore(content, title, targetKeywords);
      
      // Generate meta description
      const metaDescription = generateMetaDescription(title, content, targetKeywords);
      const suggestedTags = generateTags(title, targetKeywords);

      const response: BlogPostResponse = {
        title,
        content,
        wordCount,
        readingTime,
        seoScore: score,
        seoTips: tips,
        metaDescription,
        suggestedTags,
      };

      res.json(response);
    } catch (error) {
      console.error("Blog post generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate blog post" 
      });
    }
  });

  // Article Writer
  app.post("/api/article", async (req, res) => {
    try {
      const { topic, targetKeywords, audience, style, length, includeIntro, includeConclusion } = articleRequestSchema.parse(req.body);
      
      // Determine word count target
      const wordTargets = { short: 600, medium: 1200, long: 2000 };
      const targetWordCount = wordTargets[length];
      
      // Create article structure based on style
      const structure = createArticleStructure(topic, style, includeIntro, includeConclusion);
      
      // Generate optimized title
      const title = generateArticleTitle(topic, style, targetKeywords);
      
      // Generate content
      const content = generateArticleContent(structure, topic, targetKeywords, style, targetWordCount, audience);

      // Calculate SEO metrics
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 250);
      const { score, tips } = calculateSEOScore(content, title, targetKeywords);
      
      // Generate meta description
      const metaDescription = generateMetaDescription(title, content, targetKeywords);
      const suggestedTags = generateTags(title, targetKeywords);

      const response: ArticleResponse = {
        title,
        content,
        wordCount,
        readingTime,
        seoScore: score,
        seoTips: tips,
        metaDescription,
        suggestedTags,
        structure: structure.map(s => ({ heading: s.heading, level: s.level }))
      };

      res.json(response);
    } catch (error) {
      console.error("Article generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate article" 
      });
    }
  });

  // SEO Title & Keywords Generator
  app.post("/api/seo-title-generator", async (req, res) => {
    try {
      const { keywords, imageContext } = req.body;
      
      if (!keywords || keywords.trim().length === 0) {
        return res.status(400).json({ error: 'Keywords are required' });
      }

      // Split and clean keywords
      const keywordArray = keywords.split(',').map((k: string) => k.trim().toLowerCase()).filter((k: string) => k.length > 0);
      
      // Generate SEO title
      const seoTitle = generateSeoTitle(keywordArray, imageContext);
      
      // Generate 30 related keywords
      const relatedKeywords = generateRelatedKeywords(keywordArray, imageContext);
      const keywordString = relatedKeywords.join(', ');
      
      // Calculate title score
      const titleScore = calculateTitleScore(seoTitle, keywordArray);
      
      // Generate suggestions
      const suggestions = generateTitleSuggestions(seoTitle, keywordArray);

      const response = {
        seoTitle,
        relatedKeywords,
        keywordString,
        titleScore,
        suggestions,
      };

      res.json(response);
    } catch (error) {
      console.error('SEO Title Generation Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // SEO Title Generator Helper Functions
  function generateSeoTitle(keywords: string[], imageContext?: string): string {
    const templates = [
      `${capitalizeFirst(keywords[0] || 'image')} Guide: ${capitalizeFirst(keywords[1] || 'Complete')} ${capitalizeFirst(keywords[2] || 'Tutorial')}`,
      `Best ${capitalizeFirst(keywords[0] || 'image')} ${capitalizeFirst(keywords[1] || 'Tips')} for ${capitalizeFirst(keywords[2] || 'Success')}`,
      `Ultimate ${capitalizeFirst(keywords[0] || 'image')} ${capitalizeFirst(keywords[1] || 'Collection')}: ${capitalizeFirst(keywords[2] || 'Professional')} Guide`,
      `How to ${capitalizeFirst(keywords[0] || 'image')} ${capitalizeFirst(keywords[1] || 'Effectively')}: ${capitalizeFirst(keywords[2] || 'Expert')} Tips`,
      `${capitalizeFirst(keywords[0] || 'image')} ${capitalizeFirst(keywords[1] || 'Essentials')}: Complete ${capitalizeFirst(keywords[2] || 'Resource')} Guide`,
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
    const uniqueKeywords = Array.from(new Set(keywordVariations));
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

  function generateTitleSuggestions(title: string, keywords: string[]): string[] {
    const suggestions: string[] = [];
    
    if (title.length > 60) {
      suggestions.push('Consider shortening the title to under 60 characters for better SEO');
    }
    
    if (title.length < 40) {
      suggestions.push('Consider adding more descriptive keywords to reach 50-60 characters');
    }
    
    if (keywords.length > 0 && !title.toLowerCase().includes(keywords[0]?.toLowerCase())) {
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

  // Helper functions for content generation
  function generateBlogContent(sections: any[], title: string, keywords?: string, tone = 'professional', targetWords = 1500): string {
    const wordsPerSection = Math.floor(targetWords / sections.length);
    let content = '';

    sections.forEach((section, index) => {
      content += `## ${section.heading}\n\n`;
      
      // Generate content based on section type
      if (section.heading.toLowerCase().includes('introduction')) {
        content += generateIntroduction(title, keywords, tone, wordsPerSection);
      } else if (section.heading.toLowerCase().includes('conclusion')) {
        content += generateConclusion(title, keywords, tone, wordsPerSection);
      } else {
        content += generateSectionContent(section.heading, keywords, tone, wordsPerSection);
      }
      
      // Add subsections if they exist
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach((sub: string) => {
          content += `\n### ${sub}\n\n`;
          content += generateSubsectionContent(sub, keywords, tone, Math.floor(wordsPerSection / 3));
        });
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

  function generateSubsectionContent(heading: string, keywords?: string, tone = 'professional', targetWords = 100): string {
    const keywordText = keywords ? keywords.split(',')[0].trim() : heading.split(' ')[0];
    
    const variations = [
      `When it comes to ${heading.toLowerCase()}, I've found that the key is to keep things simple but deliberate. Don't overcomplicate it – focus on what actually moves the needle for ${keywordText} and you'll see better results.`,
      `${heading} might seem straightforward, but there are some nuances worth mentioning. Most people rush through this part, but taking time to really understand ${keywordText} here pays dividends later on.`,
      `I used to struggle with ${heading.toLowerCase()} until I realized it's all about finding the right balance. Now I approach ${keywordText} with a mix of structure and flexibility, which has worked much better for me.`,
      `Here's what I've learned about ${heading.toLowerCase()}: it's not about perfection, it's about progress. Each time you work with ${keywordText}, you'll get a little better at recognizing what works and what doesn't.`
    ];
    
    return variations[Math.floor(Math.random() * variations.length)];
  }

  function createArticleStructure(topic: string, style: string, includeIntro: boolean, includeConclusion: boolean) {
    const structure = [];
    
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

  function generateMetaDescription(title: string, content: string, keywords?: string): string {
    const keywordText = keywords ? keywords.split(',')[0].trim() : title.split(' ')[0];
    const description = `Discover everything you need to know about ${title.toLowerCase()}. Learn practical strategies, expert tips, and best practices for ${keywordText}. Complete guide with actionable insights.`;
    
    return description.length > 160 ? description.substring(0, 157) + "..." : description;
  }

  const httpServer = createServer(app);
  return httpServer;
}
