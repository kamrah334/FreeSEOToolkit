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
import { Copy, Sparkles, Target, TrendingUp, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const seoTitleRequestSchema = z.object({
  keywords: z.string().min(1, "Keywords are required"),
  imageContext: z.string().optional(),
});

type SeoTitleRequest = z.infer<typeof seoTitleRequestSchema>;

interface SeoTitleResponse {
  seoTitles: string[];
  seoTitle: string; // backward compatibility
  relatedKeywords: string[];
  keywordString: string;
  titleScores: number[];
  titleScore: number; // backward compatibility
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

  const downloadCSV = () => {
    if (!result) return;
    
    const csvContent = [
      // Headers
      'Type,Content,Score',
      // Titles
      ...result.seoTitles.map((title, index) => 
        `Title,"${title}",${result.titleScores[index] || 'N/A'}`
      ),
      // Keywords
      ...result.relatedKeywords.map(keyword => `Keyword,"${keyword}",N/A`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'seo-titles-keywords.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded!",
      description: "CSV file has been downloaded",
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
            {/* Download CSV Button */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">Export Results</h3>
                    <p className="text-sm text-blue-700">Download all titles and keywords as CSV file</p>
                  </div>
                  <Button
                    onClick={downloadCSV}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Multiple SEO Titles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Generated SEO Titles ({result.seoTitles.length} options)
                </CardTitle>
                <CardDescription>
                  Choose the title that best fits your content and audience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.seoTitles.map((title, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">Option {index + 1}</span>
                          <Badge className={getScoreColor(result.titleScores[index])}>
                            {getScoreBadge(result.titleScores[index])} ({result.titleScores[index]}/100)
                          </Badge>
                        </div>
                        <p className="text-lg font-medium text-gray-900 leading-relaxed">{title}</p>
                        <p className="text-sm text-gray-500 mt-1">{title.length} characters</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(title)}
                        className="ml-4"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {result.suggestions.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">Suggestions for Improvement:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-yellow-800">{suggestion}</li>
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
                  <span>Single-Word Keywords ({result.relatedKeywords.length} keywords)</span>
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
                  Use these single-word keywords for your content, alt text, and SEO optimization. Each keyword is unique and non-repetitive.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 font-mono leading-relaxed">
                    {result.keywordString}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Interactive Keyword Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.relatedKeywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary-100 transition-colors"
                        onClick={() => copyToClipboard(keyword)}
                        title={`Click to copy "${keyword}"`}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click any keyword to copy it individually
                  </p>
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
              <li>Click "Generate" to create 5 SEO-optimized titles and 30 single-word keywords</li>
              <li>Choose from multiple title options with SEO scores and character counts</li>
              <li>Click individual keywords or copy all keywords for SEO optimization</li>
              <li>Download all results as a CSV file for easy use in your projects</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}