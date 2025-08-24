import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Type, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { titleCaseRequestSchema, type TitleCaseRequest, type TitleCaseResponse } from "@shared/schema";

export default function TitleCaseTool() {
  const { toast } = useToast();
  const [result, setResult] = useState<TitleCaseResponse | null>(null);

  const form = useForm<TitleCaseRequest>({
    resolver: zodResolver(titleCaseRequestSchema),
    defaultValues: {
      text: "",
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (data: TitleCaseRequest) => {
      const response = await apiRequest("POST", "/api/title-case", data);
      return response.json();
    },
    onSuccess: (data: TitleCaseResponse) => {
      setResult(data);
      toast({
        title: "Title converted!",
        description: "Your title has been converted to proper case.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Conversion failed",
        description: error.message || "Failed to convert title case. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TitleCaseRequest) => {
    convertMutation.mutate(data);
  };

  const copyToClipboard = async () => {
    if (result?.converted) {
      try {
        await navigator.clipboard.writeText(result.converted);
        toast({
          title: "Copied!",
          description: "Title case result copied to clipboard.",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Title Capitalization Tool</h1>
          <p className="text-gray-600">Convert your titles to proper SEO title case with smart capitalization rules</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="text">Title or Sentence</Label>
              <Textarea
                id="text"
                rows={3}
                placeholder="Enter your title or sentence to convert..."
                {...form.register("text")}
                className="resize-none"
                data-testid="textarea-title-input"
              />
              {form.formState.errors.text && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.text.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">Example: "how to create the perfect blog post for seo"</p>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={convertMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-convert"
              >
                <Type className="h-4 w-4 mr-2" />
                Convert to Title Case
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Converted Title</h3>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-green-900">Title Case Result</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="text-green-600 hover:text-green-700"
                      data-testid="button-copy"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-lg text-gray-800 font-medium" data-testid="text-converted-title">
                    {result.converted}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Capitalization Rules Applied:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {result.rulesApplied.map((rule, index) => (
                      <li key={index}>• {rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
