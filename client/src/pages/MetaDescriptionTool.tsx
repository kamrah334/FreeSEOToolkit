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
import { metaDescriptionRequestSchema, type MetaDescriptionRequest, type MetaDescriptionResponse } from "@shared/schema";

export default function MetaDescriptionTool() {
  const { toast } = useToast();
  const [result, setResult] = useState<MetaDescriptionResponse | null>(null);

  const form = useForm<MetaDescriptionRequest>({
    resolver: zodResolver(metaDescriptionRequestSchema),
    defaultValues: {
      title: "",
      audience: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: MetaDescriptionRequest) => {
      const response = await apiRequest("POST", "/api/meta-description", data);
      return response.json();
    },
    onSuccess: (data: MetaDescriptionResponse) => {
      setResult(data);
      toast({
        title: "Meta description generated!",
        description: "Your SEO-optimized meta description is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate meta description. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MetaDescriptionRequest) => {
    generateMutation.mutate(data);
  };

  const copyToClipboard = async () => {
    if (result?.content) {
      try {
        await navigator.clipboard.writeText(result.content);
        toast({
          title: "Copied!",
          description: "Meta description copied to clipboard.",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meta Description Generator</h1>
          <p className="text-gray-600">Generate SEO-optimized meta descriptions that improve click-through rates</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Blog Title or Topic</Label>
              <Input
                id="title"
                placeholder="Enter your blog title or main topic..."
                {...form.register("title")}
                data-testid="input-title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">Example: "Complete Guide to SEO Optimization"</p>
            </div>

            <div>
              <Label htmlFor="audience">Target Audience (Optional)</Label>
              <Select value={form.watch("audience")} onValueChange={(value) => form.setValue("audience", value)}>
                <SelectTrigger data-testid="select-audience">
                  <SelectValue placeholder="Select target audience..." />
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

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={generateMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700"
                data-testid="button-generate"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generateMutation.isPending ? "Generating..." : "Generate Meta Description"}
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div>
                <span className="text-gray-600">Generating meta description...</span>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8" data-testid="results-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Meta Description</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-green-900">Meta Description</h4>
                  <span className="text-sm text-green-600 font-mono" data-testid="text-character-count">
                    {result.length} characters
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed mb-4" data-testid="text-meta-description">
                  {result.content}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-green-600 hover:text-green-700"
                  data-testid="button-copy"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
