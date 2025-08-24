import { VercelRequest, VercelResponse } from '@vercel/node';
import { metaDescriptionRequestSchema, type MetaDescriptionResponse } from "../shared/schema";

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

    res.status(200).json(response);
  } catch (error) {
    console.error("Meta description generation error:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to generate meta description" 
    });
  }
}