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

// Helper function to call Hugging Face API
async function callHuggingFace(prompt: string): Promise<string> {
  const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || process.env.HF_API_KEY || "";
  
  if (!HUGGING_FACE_API_KEY) {
    throw new Error("Hugging Face API key not configured");
  }

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

  throw lastError || new Error("All models failed to generate content");
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
    
    let sections: any[] = [];
    
    try {
      const audienceText = audience ? ` for ${audience}` : "";
      const lengthText = validatedLength === "short" ? "5-7 sections" : 
                       validatedLength === "medium" ? "7-10 sections" : "10-15 sections";
      
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
      if (validatedLength === "short") {
        sections = baseOutline.slice(0, 4);
      } else if (validatedLength === "medium") {
        sections = baseOutline.slice(0, 5);
      } else {
        sections = baseOutline;
      }
    }

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