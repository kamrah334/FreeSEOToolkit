import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Sparkles, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { blogOutlineRequestSchema, type BlogOutlineRequest, type BlogOutlineResponse } from "@shared/schema";

export default function BlogOutlineTool() {
  const { toast } = useToast();
  const [result, setResult] = useState<BlogOutlineResponse | null>(null);

  const form = useForm<BlogOutlineRequest>({
    resolver: zodResolver(blogOutlineRequestSchema),
    defaultValues: {
      topic: "",
      audience: "",
      length: "medium",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: BlogOutlineRequest) => {
      const response = await apiRequest("POST", "/api/blog-outline", data);
      return response.json();
    },
    onSuccess: (data: BlogOutlineResponse) => {
      setResult(data);
      toast({
        title: "Outline generated!",
        description: "Your blog outline is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate blog outline. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogOutlineRequest) => {
    generateMutation.mutate(data);
  };

  const copyOutline = async () => {
    if (result) {
      const outlineText = `${result.title}\n\n${result.sections.map((section, index) => {
        let text = `${index + 1}. ${section.heading}`;
        if (section.subsections && section.subsections.length > 0) {
          text += `\n${section.subsections.map(sub => `   - ${sub}`).join('\n')}`;
        }
        return text;
      }).join('\n\n')}`;

      try {
        await navigator.clipboard.writeText(outlineText);
        toast({
          title: "Copied!",
          description: "Blog outline copied to clipboard.",
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Outline Generator</h1>
          <p className="text-gray-600">Create structured blog outlines with AI-generated headings and subheadings</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="topic">Blog Topic or Headline</Label>
              <Input
                id="topic"
                placeholder="Enter your blog topic or main headline..."
                {...form.register("topic")}
                data-testid="input-topic"
              />
              {form.formState.errors.topic && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.topic.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">Example: "Complete Guide to Email Marketing for Small Businesses"</p>
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
                <Label htmlFor="length">Content Length</Label>
                <Select value={form.watch("length")} onValueChange={(value) => form.setValue("length", value as any)}>
                  <SelectTrigger data-testid="select-length">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (800-1500 words)</SelectItem>
                    <SelectItem value="medium">Medium (1500-3000 words)</SelectItem>
                    <SelectItem value="long">Long (3000+ words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={generateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
                data-testid="button-generate"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generateMutation.isPending ? "Generating..." : "Generate Blog Outline"}
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                <span className="text-gray-600">Generating blog outline...</span>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8" data-testid="results-section">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Generated Blog Outline</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyOutline}
                  className="text-purple-600 hover:text-purple-700"
                  data-testid="button-copy"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Outline
                </Button>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="space-y-4 font-mono text-sm">
                  <div className="text-xl font-bold text-purple-900 mb-4" data-testid="text-outline-title">
                    {result.title}
                  </div>
                  
                  {result.sections.map((section, index) => (
                    <div key={index} className="space-y-2" data-testid={`section-${index}`}>
                      <div className="text-lg font-semibold text-purple-800">
                        {index + 1}. {section.heading}
                      </div>
                      {section.subsections && section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="ml-4 text-purple-700">
                          - {subsection}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Outline Statistics:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-blue-700">
                    <span className="font-medium">Sections:</span> {result.sections.length}
                  </div>
                  <div className="text-blue-700">
                    <span className="font-medium">Subsections:</span> {result.sections.reduce((sum, section) => sum + (section.subsections?.length || 0), 0)}
                  </div>
                  <div className="text-blue-700">
                    <span className="font-medium">Est. Word Count:</span> {result.estimatedWordCount.toLocaleString()}
                  </div>
                  <div className="text-blue-700">
                    <span className="font-medium">Reading Time:</span> {result.estimatedReadingTime} min
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
