import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  metaDescriptionRequestSchema,
  titleCaseRequestSchema,
  keywordDensityRequestSchema,
  blogOutlineRequestSchema,
  type MetaDescriptionResponse,
  type TitleCaseResponse,
  type KeywordDensityResponse,
  type BlogOutlineResponse
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || process.env.HF_API_KEY || "";

  // Helper function to call Hugging Face API
  async function callHuggingFace(prompt: string): Promise<string> {
    if (!HUGGING_FACE_API_KEY) {
      throw new Error("Hugging Face API key not configured");
    }

    try {
      // Try microsoft/DialoGPT-medium first, fallback to gpt2 if needed
      const models = [
        "microsoft/DialoGPT-medium",
        "gpt2",
        "distilgpt2"
      ];

      let lastError: Error | null = null;

      for (const model of models) {
        try {
          const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs: prompt,
                parameters: {
                  max_new_tokens: 100,
                  temperature: 0.7,
                  do_sample: true,
                },
              }),
            }
          );

          if (response.ok) {
            const result = await response.json();
            const generated = result[0]?.generated_text || result.generated_text || "";
            
            // Clean up the response by removing the original prompt if it's included
            const cleanedText = generated.replace(prompt, "").trim();
            return cleanedText || generated;
          } else {
            const errorText = await response.text();
            lastError = new Error(`Model ${model}: ${response.status} ${errorText}`);
            console.warn(`Failed with model ${model}:`, lastError.message);
            continue;
          }
        } catch (error) {
          lastError = error as Error;
          console.warn(`Error with model ${model}:`, error);
          continue;
        }
      }

      // If all models fail, provide a fallback response
      throw lastError || new Error("All models failed to generate content");
    } catch (error) {
      console.error("Hugging Face API error:", error);
      throw new Error("Failed to generate AI content");
    }
  }

  // Meta Description Generator
  app.post("/api/meta-description", async (req, res) => {
    try {
      const { title, audience } = metaDescriptionRequestSchema.parse(req.body);
      
      let content: string;
      
      try {
        const audienceText = audience ? ` for ${audience}` : "";
        const prompt = `Write a compelling SEO meta description (150-160 characters) for this blog post title: "${title}"${audienceText}. Make it engaging and include relevant keywords.`;
        
        const aiResponse = await callHuggingFace(prompt);
        content = aiResponse.trim();
      } catch (aiError) {
        console.warn("AI generation failed, using template fallback:", aiError);
        
        // Template-based fallback
        const audienceText = audience ? ` for ${audience}` : "";
        const keywords = title.toLowerCase().split(/\s+/).slice(0, 3).join(", ");
        
        content = `Discover ${title.toLowerCase()}${audienceText}. Learn about ${keywords} and get actionable insights. Read our comprehensive guide now.`;
      }
      
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
      
      let sections: any[] = [];
      
      try {
        const audienceText = audience ? ` for ${audience}` : "";
        const lengthText = length === "short" ? "5-7 sections" : 
                         length === "medium" ? "7-10 sections" : "10-15 sections";
        
        const prompt = `Create a detailed blog outline for: "${topic}"${audienceText}. Include ${lengthText} with H1, H2, and H3 headings. Structure it as a comprehensive guide with introduction and conclusion.`;
        
        const aiResponse = await callHuggingFace(prompt);
        
        // Parse the AI response into structured sections
        const lines = aiResponse.split('\n').filter(line => line.trim());
        let currentSection: any = null;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.match(/^\d+\./)) {
            // Main section (H2)
            if (currentSection) sections.push(currentSection);
            currentSection = {
              heading: trimmed.replace(/^\d+\.\s*/, ''),
              level: 2,
              subsections: []
            };
          } else if (trimmed.startsWith('-') && currentSection) {
            // Subsection (H3)
            currentSection.subsections.push(trimmed.replace(/^-\s*/, ''));
          }
        }
        
        if (currentSection) sections.push(currentSection);
      } catch (aiError) {
        console.warn("AI outline generation failed, using template fallback:", aiError);
        sections = []; // Reset sections to use template fallback
      }

      // Fallback if AI response failed or is not well structured
      if (sections.length === 0) {
        const topicWords = topic.split(' ');
        const mainKeyword = topicWords[0];
        
        const baseOutline = [
          { 
            heading: "Introduction", 
            level: 2, 
            subsections: [`What is ${topic}?`, "Why this matters", "What you'll learn"] 
          },
          { 
            heading: `Understanding ${mainKeyword}`, 
            level: 2, 
            subsections: ["Key concepts", "Important terminology", "Common misconceptions"] 
          },
          { 
            heading: `Getting Started with ${topic}`, 
            level: 2, 
            subsections: ["Prerequisites", "Step-by-step approach", "Tools and resources"] 
          },
          { 
            heading: "Best Practices", 
            level: 2, 
            subsections: ["Proven strategies", "Expert tips", "Common mistakes to avoid"] 
          },
          { 
            heading: "Advanced Techniques", 
            level: 2, 
            subsections: ["Pro-level strategies", "Optimization tips", "Measuring success"] 
          },
          { 
            heading: "Conclusion", 
            level: 2, 
            subsections: ["Key takeaways", "Next steps", "Additional resources"] 
          }
        ];
        
        // Adjust outline based on length
        if (length === "short") {
          sections = baseOutline.slice(0, 4);
        } else if (length === "medium") {
          sections = baseOutline.slice(0, 5);
        } else {
          sections = baseOutline;
        }
      }

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

  const httpServer = createServer(app);
  return httpServer;
}
