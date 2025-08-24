import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, FileEdit, Copy, BarChart3, Tags, Clock, FileText, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { articleRequestSchema, type ArticleRequest, type ArticleResponse } from "@shared/schema";

export default function ArticleWriterTool() {
  const { toast } = useToast();
  const [result, setResult] = useState<ArticleResponse | null>(null);

  const form = useForm<ArticleRequest>({
    resolver: zodResolver(articleRequestSchema),
    defaultValues: {
      topic: "",
      targetKeywords: "",
      audience: "",
      style: "how-to",
      length: "medium",
      includeIntro: true,
      includeConclusion: true,
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: ArticleRequest) => {
      // Transform data to match API expectations
      const apiData = {
        topic: data.topic,
        style: data.style,
        targetWords: data.length === 'short' ? 600 : data.length === 'medium' ? 1200 : 2000,
        audience: data.audience || 'general',
        includeIntro: data.includeIntro,
        includeConclusion: data.includeConclusion,
        keywords: data.targetKeywords
      };
      const response = await apiRequest("POST", "/api/article", apiData);
      return response.json();
    },
    onSuccess: (data: ArticleResponse) => {
      setResult(data);
      toast({
        title: "Article generated!",
        description: "Your SEO-optimized article is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArticleRequest) => {
    generateMutation.mutate(data);
  };

  const copyContent = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result.content);
        toast({
          title: "Copied!",
          description: "Article content copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const clearForm = () => {
    form.reset();
    setResult(null);
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStyleDescription = (style: string) => {
    switch (style) {
      case "how-to": return "Step-by-step guides and tutorials";
      case "listicle": return "Numbered lists and bullet points";
      case "news": return "Breaking news and updates";
      case "opinion": return "Personal perspectives and views";
      case "research": return "Data-driven analysis and findings";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Article Writer</h1>
          <p className="text-gray-600">Create professional articles with customizable styles and automatic SEO optimization</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="topic">Article Topic</Label>
                <Input
                  id="topic"
                  placeholder="Enter your article topic..."
                  {...form.register("topic")}
                  data-testid="input-topic"
                />
                {form.formState.errors.topic && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.topic.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Example: "Digital Marketing Trends for Small Businesses"</p>
              </div>

              <div>
                <Label htmlFor="targetKeywords">Target Keywords (Optional)</Label>
                <Input
                  id="targetKeywords"
                  placeholder="keyword1, keyword2, keyword3"
                  {...form.register("targetKeywords")}
                  data-testid="input-keywords"
                />
                <p className="text-sm text-gray-500 mt-1">Comma-separated keywords for SEO optimization</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audience">Target Audience (Optional)</Label>
                  <Select value={form.watch("audience")} onValueChange={(value) => form.setValue("audience", value)}>
                    <SelectTrigger data-testid="select-audience">
                      <SelectValue placeholder="Select audience..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginners">Beginners</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="business-owners">Business Owners</SelectItem>
                      <SelectItem value="marketers">Marketers</SelectItem>
                      <SelectItem value="developers">Developers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="style">Article Style</Label>
                  <Select value={form.watch("style")} onValueChange={(value) => form.setValue("style", value as any)}>
                    <SelectTrigger data-testid="select-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="how-to">How-to Guide</SelectItem>
                      <SelectItem value="listicle">Listicle</SelectItem>
                      <SelectItem value="news">News Article</SelectItem>
                      <SelectItem value="opinion">Opinion Piece</SelectItem>
                      <SelectItem value="research">Research Article</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">{getStyleDescription(form.watch("style"))}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="length">Content Length</Label>
                <Select value={form.watch("length")} onValueChange={(value) => form.setValue("length", value as any)}>
                  <SelectTrigger data-testid="select-length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (600-900 words)</SelectItem>
                    <SelectItem value="medium">Medium (1200-1800 words)</SelectItem>
                    <SelectItem value="long">Long (2000+ words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Article Structure</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeIntro"
                    checked={form.watch("includeIntro")}
                    onCheckedChange={(checked) => form.setValue("includeIntro", checked as boolean)}
                    data-testid="checkbox-intro"
                  />
                  <Label htmlFor="includeIntro" className="text-sm font-normal">Include Introduction</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeConclusion"
                    checked={form.watch("includeConclusion")}
                    onCheckedChange={(checked) => form.setValue("includeConclusion", checked as boolean)}
                    data-testid="checkbox-conclusion"
                  />
                  <Label htmlFor="includeConclusion" className="text-sm font-normal">Include Conclusion</Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={generateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-generate"
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  {generateMutation.isPending ? "Generating..." : "Generate Article"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={clearForm}
                  data-testid="button-clear"
                >
                  Clear
                </Button>
              </div>
            </form>

            {generateMutation.isPending && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg" data-testid="loading-state">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Generating SEO-optimized article...</span>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8" data-testid="results-section">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Generated Article</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyContent}
                  className="text-blue-600 hover:text-blue-700"
                  data-testid="button-copy"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Content
                </Button>
              </div>

              {/* Title */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Generated Title</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-900" data-testid="text-article-title">{result.title}</h2>
                </div>
              </div>

              {/* SEO Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.wordCount}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Words
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.readingTime}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Min Read
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getSEOScoreColor(result.seoScore).split(' ')[0]}`}>
                    {result.seoScore}%
                  </div>
                  <div className="text-sm text-gray-500 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    SEO Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.structure.length}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center">
                    <List className="h-4 w-4 mr-1" />
                    Sections
                  </div>
                </div>
              </div>

              {/* SEO Score Details */}
              <div className={`p-4 rounded-lg border mb-6 ${getSEOScoreColor(result.seoScore)}`}>
                <h4 className="font-medium mb-2">SEO Analysis</h4>
                {result.seoTips.length > 0 && (
                  <ul className="text-sm space-y-1">
                    {result.seoTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
                {result.seoTips.length === 0 && (
                  <p className="text-sm">Great! Your content meets all SEO best practices.</p>
                )}
              </div>

              {/* Article Structure */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Article Structure</h4>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="space-y-2">
                    {result.structure.map((section, index) => (
                      <div key={index} className="flex items-center" data-testid={`structure-${index}`}>
                        <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-3 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{section.level}</span>
                        </div>
                        <span className="text-sm text-gray-700">{section.heading}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meta Description */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Generated Meta Description</h4>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800" data-testid="text-meta-description">{result.metaDescription}</p>
                </div>
              </div>

              {/* Suggested Tags */}
              {result.suggestedTags.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Suggested Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" data-testid={`tag-${index}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  <div className="prose prose-sm max-w-none" data-testid="content-preview">
                    {result.content.substring(0, 400)}...
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click "Copy Content" to get the full article
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}