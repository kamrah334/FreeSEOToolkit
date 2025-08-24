import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, Copy, AlertTriangle, CheckCircle, XCircle, BarChart3, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const aiDetectionRequestSchema = z.object({
  content: z.string().min(50, "Content must be at least 50 characters long"),
});

type AiDetectionRequest = z.infer<typeof aiDetectionRequestSchema>;

interface AiDetectionResponse {
  aiProbability: number;
  humanProbability: number;
  verdict: string;
  confidence: string;
  analysis: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordsPerSentence: number;
    indicators: {
      repetitivePatterns: { score: number; description: string };
      personalTouch: { score: number; description: string };
      conversationalFlow: { score: number; description: string };
      humanMarkers: { score: number; description: string };
    };
  };
  recommendations: string[];
  detailedBreakdown: {
    grammar: string;
    vocabulary: string;
    structure: string;
    tone: string;
  };
}

export default function AiDetectorTool() {
  const { toast } = useToast();
  const [result, setResult] = useState<AiDetectionResponse | null>(null);

  const form = useForm<AiDetectionRequest>({
    resolver: zodResolver(aiDetectionRequestSchema),
    defaultValues: {
      content: "",
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: AiDetectionRequest) => {
      const response = await apiRequest("POST", "/api/ai-detector", data);
      return response.json();
    },
    onSuccess: (data: AiDetectionResponse) => {
      setResult(data);
      toast({
        title: "Analysis complete!",
        description: `Content analyzed with ${data.confidence.toLowerCase()} confidence.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AiDetectionRequest) => {
    analyzeMutation.mutate(data);
  };

  const copyResults = async () => {
    if (result) {
      const resultText = `AI Detection Analysis Results:
      
Verdict: ${result.verdict}
Confidence: ${result.confidence}
AI Probability: ${result.aiProbability}%
Human Probability: ${result.humanProbability}%

Word Count: ${result.analysis.wordCount}
Sentences: ${result.analysis.sentenceCount}
Paragraphs: ${result.analysis.paragraphCount}

Detailed Analysis:
- Grammar: ${result.detailedBreakdown.grammar}
- Vocabulary: ${result.detailedBreakdown.vocabulary}
- Structure: ${result.detailedBreakdown.structure}
- Tone: ${result.detailedBreakdown.tone}

Recommendations:
${result.recommendations.map(rec => `- ${rec}`).join('\n')}`;

      try {
        await navigator.clipboard.writeText(resultText);
        toast({
          title: "Copied!",
          description: "Analysis results copied to clipboard.",
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

  const getVerdictColor = (aiProbability: number) => {
    if (aiProbability >= 80) return "text-red-600 bg-red-50 border-red-200";
    if (aiProbability >= 60) return "text-orange-600 bg-orange-50 border-orange-200";
    if (aiProbability >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (aiProbability >= 20) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getVerdictIcon = (aiProbability: number) => {
    if (aiProbability >= 80) return <XCircle className="h-5 w-5 text-red-600" />;
    if (aiProbability >= 60) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    if (aiProbability >= 40) return <Eye className="h-5 w-5 text-yellow-600" />;
    if (aiProbability >= 20) return <CheckCircle className="h-5 w-5 text-blue-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Content Detector</h1>
          <p className="text-gray-600">Analyze content to detect AI-generated text and get recommendations for human-like improvements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="content">Content to Analyze</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your content here for AI detection analysis..."
                  className="min-h-[300px] resize-none"
                  {...form.register("content")}
                  data-testid="textarea-content"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.content.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Minimum 50 characters required. Longer content provides more accurate analysis.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Analyzes writing patterns and language structure</li>
                  <li>• Checks for human markers like personal experiences and conversational tone</li>
                  <li>• Provides confidence scores and detailed recommendations</li>
                  <li>• Helps improve content to sound more natural and human-like</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={analyzeMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-analyze"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {analyzeMutation.isPending ? "Analyzing..." : "Analyze Content"}
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

            {analyzeMutation.isPending && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg" data-testid="loading-state">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-gray-600">Analyzing content patterns...</span>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8" data-testid="results-section">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyResults}
                  className="text-purple-600 hover:text-purple-700"
                  data-testid="button-copy"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Results
                </Button>
              </div>

              {/* Main Verdict */}
              <div className={`p-6 rounded-lg border mb-6 ${getVerdictColor(result.aiProbability)}`}>
                <div className="flex items-center mb-3">
                  {getVerdictIcon(result.aiProbability)}
                  <h4 className="font-semibold ml-2" data-testid="text-verdict">{result.verdict}</h4>
                </div>
                <p className="text-sm mb-4">Confidence Level: <strong>{result.confidence}</strong></p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold mb-1">{result.aiProbability}%</div>
                    <div className="text-sm">AI Probability</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: `${result.aiProbability}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold mb-1">{result.humanProbability}%</div>
                    <div className="text-sm">Human Probability</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: `${result.humanProbability}%`}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.analysis.wordCount}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Words
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.analysis.sentenceCount}</div>
                  <div className="text-sm text-gray-500">
                    Sentences
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.analysis.paragraphCount}</div>
                  <div className="text-sm text-gray-500">
                    Paragraphs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.analysis.averageWordsPerSentence}</div>
                  <div className="text-sm text-gray-500">
                    Avg Words/Sentence
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Detailed Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Grammar:</span>
                    <span className="text-sm text-gray-600">{result.detailedBreakdown.grammar}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Vocabulary:</span>
                    <span className="text-sm text-gray-600">{result.detailedBreakdown.vocabulary}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Structure:</span>
                    <span className="text-sm text-gray-600">{result.detailedBreakdown.structure}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Tone:</span>
                    <span className="text-sm text-gray-600">{result.detailedBreakdown.tone}</span>
                  </div>
                </div>
              </div>

              {/* Indicators */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Analysis Indicators</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Personal Touch</span>
                      <Badge variant={result.analysis.indicators.personalTouch.score >= 2 ? "default" : "secondary"}>
                        Score: {result.analysis.indicators.personalTouch.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.analysis.indicators.personalTouch.description}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Conversational Flow</span>
                      <Badge variant={result.analysis.indicators.conversationalFlow.score > 0.5 ? "default" : "secondary"}>
                        Score: {result.analysis.indicators.conversationalFlow.score.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.analysis.indicators.conversationalFlow.description}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Human Markers</span>
                      <Badge variant={result.analysis.indicators.humanMarkers.score > 3 ? "default" : "secondary"}>
                        Score: {result.analysis.indicators.humanMarkers.score}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{result.analysis.indicators.humanMarkers.description}</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {result.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded">
                        <BarChart3 className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-800" data-testid={`recommendation-${index}`}>
                          {recommendation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}