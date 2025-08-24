import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { keywordDensityRequestSchema, type KeywordDensityRequest, type KeywordDensityResponse } from "@shared/schema";

export default function KeywordDensityTool() {
  const { toast } = useToast();
  const [result, setResult] = useState<KeywordDensityResponse | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const form = useForm<KeywordDensityRequest>({
    resolver: zodResolver(keywordDensityRequestSchema),
    defaultValues: {
      content: "",
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: KeywordDensityRequest) => {
      const response = await apiRequest("POST", "/api/keyword-density", data);
      return response.json();
    },
    onSuccess: (data: KeywordDensityResponse) => {
      setResult(data);
      toast({
        title: "Analysis complete!",
        description: "Your keyword density analysis is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze keyword density. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: KeywordDensityRequest) => {
    analyzeMutation.mutate(data);
  };

  const clearForm = () => {
    form.reset();
    setResult(null);
    setWordCount(0);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    form.setValue("content", content);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      low: "bg-gray-100 text-gray-800",
      good: "bg-green-100 text-green-800",
      optimal: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.good}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Keyword Density Checker</h1>
          <p className="text-gray-600">Analyze keyword frequency and density in your content</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="content">Content to Analyze</Label>
              <Textarea
                id="content"
                rows={8}
                placeholder="Paste your blog content, article, or any text you want to analyze for keyword density..."
                {...form.register("content")}
                onChange={handleContentChange}
                className="resize-none"
                data-testid="textarea-content"
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.content.message}</p>
              )}
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Minimum 50 words for accurate analysis</span>
                <span data-testid="text-word-count">{wordCount} words</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={analyzeMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
                data-testid="button-analyze"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze Keyword Density"}
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

          {result && (
            <div className="mt-8" data-testid="results-section">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Keyword Density Analysis</h3>
                <div className="text-sm text-gray-600">
                  Total words: <span className="font-medium" data-testid="text-total-words">{result.totalWords}</span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600" data-testid="text-unique-keywords">
                    {result.uniqueKeywords}
                  </div>
                  <div className="text-sm text-blue-700">Unique Keywords</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-top-density">
                    {result.topKeywordDensity}%
                  </div>
                  <div className="text-sm text-green-700">Top Keyword Density</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600" data-testid="text-avg-density">
                    {result.avgDensity}%
                  </div>
                  <div className="text-sm text-orange-700">Average Density</div>
                </div>
              </div>

              {/* Keyword Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Top Keywords</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Keyword
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Density
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.keywords.map((keyword, index) => (
                        <tr key={index} data-testid={`row-keyword-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {keyword.word}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {keyword.frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {keyword.density}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(keyword.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
