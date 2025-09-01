import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkles, Target, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const seoTitleRequestSchema = z.object({
  keywords: z.string().min(1, "Keywords are required"),
  imageContext: z.string().optional(),
});

type SeoTitleRequest = z.infer<typeof seoTitleRequestSchema>;

interface SeoTitleResponse {
  seoTitle: string;
  relatedKeywords: string[];
  keywordString: string;
  titleScore: number;
  suggestions: string[];
}

export default function SeoTitleGeneratorTool() {
  const [result, setResult] = useState<SeoTitleResponse | null>(null);
  
  const form = useForm<SeoTitleRequest>({
    resolver: zodResolver(seoTitleRequestSchema),
    defaultValues: {
      keywords: "",
      imageContext: "",
    },
  });

  const generateTitle = useMutation({
    mutationFn: async (data: SeoTitleRequest): Promise<SeoTitleResponse> => {
      const response = await fetch("/api/seo-title-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate SEO title");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate SEO title. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SeoTitleRequest) => {
    generateTitle.mutate(data);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            SEO Title & Keywords Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate SEO-optimized titles and related keywords for your images and content
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              Generate SEO Title & Keywords
            </CardTitle>
            <CardDescription>
              Enter keywords related to your image or content to generate an SEO-optimized title and 30 related keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="keywords">Keywords (comma-separated) *</Label>
                <Input
                  id="keywords"
                  placeholder="photography, nature, landscape, sunset"
                  {...form.register("keywords")}
                  className="mt-1"
                />
                {form.formState.errors.keywords && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.keywords.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="imageContext">Image Context (optional)</Label>
                <Textarea
                  id="imageContext"
                  placeholder="Describe your image or content context (e.g., mountain landscape at golden hour)"
                  rows={3}
                  {...form.register("imageContext")}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={generateTitle.isPending}
              >
                {generateTitle.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Generate SEO Title & Keywords
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            {/* SEO Title */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Generated SEO Title
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge className={getScoreColor(result.titleScore)}>
                      {getScoreBadge(result.titleScore)} ({result.titleScore}/100)
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.seoTitle)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-medium text-gray-900">{result.seoTitle}</p>
                </div>
                
                {result.suggestions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Suggestions for Improvement:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-600">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Related Keywords (30 keywords)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.keywordString)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                </CardTitle>
                <CardDescription>
                  Use these keywords for your content, alt text, and SEO optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 font-mono leading-relaxed">
                    {result.keywordString}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Keyword Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.relatedKeywords.slice(0, 15).map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary-100"
                        onClick={() => copyToClipboard(keyword)}
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {result.relatedKeywords.length > 15 && (
                      <Badge variant="outline">
                        +{result.relatedKeywords.length - 15} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How to Use Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Use This Tool</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ol className="list-decimal list-inside space-y-2">
              <li>Enter keywords related to your image or content (separated by commas)</li>
              <li>Optionally provide context about your image for better results</li>
              <li>Click "Generate" to create an SEO-optimized title and 30 related keywords</li>
              <li>Use the generated title for your content, blog posts, or image descriptions</li>
              <li>Copy the keyword string for use in alt text, meta tags, or content optimization</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}