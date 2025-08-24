import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const AiDetectionSchema = z.object({
  content: z.string().min(50, "Content must be at least 50 characters long"),
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content } = AiDetectionSchema.parse(req.body);
    
    const analysis = analyzeContentForAI(content);
    
    res.status(200).json(analysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

function analyzeContentForAI(content: string) {
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  // AI Detection Indicators
  const indicators = {
    repetitivePatterns: detectRepetitivePatterns(content),
    formalLanguage: detectFormalLanguage(content),
    lackOfPersonalTouches: detectPersonalTouches(content),
    perfectGrammar: detectGrammarPerfection(content),
    genericPhrases: detectGenericPhrases(content),
    sentenceVariation: analyzeSentenceVariation(sentences),
    humanMarkers: detectHumanMarkers(content),
    conversationalFlow: analyzeConversationalFlow(content)
  };

  // Calculate AI probability score (0-100, where 100 = very likely AI)
  let aiScore = 0;
  
  if (indicators.repetitivePatterns > 3) aiScore += 15;
  if (indicators.formalLanguage > 0.7) aiScore += 20;
  if (indicators.lackOfPersonalTouches < 2) aiScore += 25;
  if (indicators.perfectGrammar > 0.95) aiScore += 15;
  if (indicators.genericPhrases > 5) aiScore += 15;
  if (indicators.sentenceVariation < 0.3) aiScore += 10;
  
  // Reduce score for human markers
  aiScore -= (indicators.humanMarkers * 5);
  aiScore -= (indicators.conversationalFlow * 10);
  
  aiScore = Math.max(0, Math.min(100, aiScore));
  
  const humanProbability = 100 - aiScore;
  
  return {
    aiProbability: aiScore,
    humanProbability,
    verdict: getVerdict(aiScore),
    confidence: getConfidenceLevel(aiScore),
    analysis: {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      averageWordsPerSentence: Math.round(words.length / sentences.length),
      indicators: {
        repetitivePatterns: {
          score: indicators.repetitivePatterns,
          description: indicators.repetitivePatterns > 3 ? 
            "High repetition detected - may indicate AI generation" : 
            "Natural variation in language patterns"
        },
        personalTouch: {
          score: indicators.lackOfPersonalTouches,
          description: indicators.lackOfPersonalTouches < 2 ? 
            "Limited personal anecdotes or experiences" : 
            "Contains personal experiences and human perspective"
        },
        conversationalFlow: {
          score: indicators.conversationalFlow,
          description: indicators.conversationalFlow > 0.5 ? 
            "Natural conversational flow detected" : 
            "Formal, structured writing style"
        },
        humanMarkers: {
          score: indicators.humanMarkers,
          description: indicators.humanMarkers > 3 ? 
            "Multiple human writing markers present" : 
            "Few conversational or informal elements"
        }
      }
    },
    recommendations: generateRecommendations(aiScore, indicators),
    detailedBreakdown: {
      grammar: indicators.perfectGrammar > 0.95 ? "Too perfect - may indicate AI" : "Natural grammar with minor imperfections",
      vocabulary: indicators.formalLanguage > 0.7 ? "Overly formal vocabulary" : "Natural vocabulary variation",
      structure: indicators.sentenceVariation < 0.3 ? "Repetitive sentence structure" : "Good sentence variety",
      tone: indicators.conversationalFlow > 0.5 ? "Conversational and engaging" : "Formal and structured"
    }
  };
}

function detectRepetitivePatterns(content: string): number {
  const sentences = content.split(/[.!?]+/);
  const patterns: string[] = [];
  
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (words.length > 3) {
      const start = words.slice(0, 3).join(' ').toLowerCase();
      patterns.push(start);
    }
  }
  
  // Count repeated starting patterns
  const patternCounts = patterns.reduce((acc, pattern) => {
    acc[pattern] = (acc[pattern] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.values(patternCounts).filter(count => count > 1).length;
}

function detectFormalLanguage(content: string): number {
  const formalWords = [
    'furthermore', 'moreover', 'consequently', 'subsequently', 'therefore',
    'however', 'nevertheless', 'nonetheless', 'additionally', 'specifically',
    'particularly', 'essentially', 'ultimately', 'fundamentally', 'accordingly'
  ];
  
  const words = content.toLowerCase().split(/\s+/);
  const formalCount = words.filter(word => formalWords.includes(word)).length;
  return formalCount / words.length;
}

function detectPersonalTouches(content: string): number {
  const personalMarkers = [
    /\bi\s+(think|believe|feel|remember|learned|experienced|noticed|realized)/gi,
    /\bmy\s+(experience|opinion|perspective|approach|journey|story)/gi,
    /\bwhen\s+i\s+(first|started|began|was|tried)/gi,
    /\byou know\b/gi,
    /\bhonestly\b/gi,
    /\bfrankly\b/gi,
    /\bbetween you and me\b/gi,
    /\bin my opinion\b/gi,
    /\blet me tell you\b/gi,
    /\bhere's the thing\b/gi
  ];
  
  return personalMarkers.reduce((count, pattern) => {
    const matches = content.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
}

function detectGrammarPerfection(content: string): number {
  // Simple grammar check - look for common imperfections
  const imperfections = [
    /\band\s+and\b/gi,  // repeated "and"
    /\bthat\s+that\b/gi,  // repeated "that"
    /\.\s*\w/g,  // missing space after period
    /\s+,/g,  // space before comma
    /\s{2,}/g  // multiple spaces
  ];
  
  const errors = imperfections.reduce((count, pattern) => {
    const matches = content.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  // Return perfection score (fewer errors = higher perfection)
  const totalSentences = content.split(/[.!?]+/).length;
  return Math.max(0, (totalSentences - errors) / totalSentences);
}

function detectGenericPhrases(content: string): number {
  const genericPhrases = [
    /\bin conclusion\b/gi,
    /\bin summary\b/gi,
    /\bto sum up\b/gi,
    /\bfirst and foremost\b/gi,
    /\blast but not least\b/gi,
    /\bit is important to note\b/gi,
    /\bit should be noted\b/gi,
    /\bit is worth mentioning\b/gi,
    /\bmany experts believe\b/gi,
    /\bstudies have shown\b/gi,
    /\bresearch indicates\b/gi,
    /\baccording to experts\b/gi
  ];
  
  return genericPhrases.reduce((count, pattern) => {
    const matches = content.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
}

function analyzeSentenceVariation(sentences: string[]): number {
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  
  // Calculate variance
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Higher variation = more human-like
  return Math.min(1, standardDeviation / avgLength);
}

function detectHumanMarkers(content: string): number {
  const humanMarkers = [
    /\b(um|uh|er|ah)\b/gi,
    /\b(well|you know|i mean|like|actually|basically|literally)\b/gi,
    /\b(kinda|sorta|gonna|wanna)\b/gi,
    /\([^)]*\)/g,  // parenthetical asides
    /\btrust me\b/gi,
    /\bbelieve me\b/gi,
    /\bto be honest\b/gi,
    /\breal talk\b/gi,
    /\bno kidding\b/gi,
    /\bfor real\b/gi
  ];
  
  return humanMarkers.reduce((count, pattern) => {
    const matches = content.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
}

function analyzeConversationalFlow(content: string): number {
  const conversationalElements = [
    /\?/g,  // questions
    /\!/g,  // exclamations
    /\b(but|and|so|because|since|while)\s+/gi,  // connectors
    /\byou\b/gi,  // direct address
    /\bwe\b/gi,   // inclusive language
    /\blet's\b/gi,
    /\bhere's\b/gi,
    /\bthere's\b/gi
  ];
  
  const totalElements = conversationalElements.reduce((count, pattern) => {
    const matches = content.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  const wordCount = content.split(/\s+/).length;
  return Math.min(1, totalElements / (wordCount * 0.1));
}

function getVerdict(aiScore: number): string {
  if (aiScore >= 80) return "Very likely AI-generated";
  if (aiScore >= 60) return "Possibly AI-generated";
  if (aiScore >= 40) return "Mixed signals - uncertain";
  if (aiScore >= 20) return "Likely human-written";
  return "Very likely human-written";
}

function getConfidenceLevel(aiScore: number): string {
  if (aiScore >= 80 || aiScore <= 20) return "High";
  if (aiScore >= 60 || aiScore <= 40) return "Medium";
  return "Low";
}

function generateRecommendations(aiScore: number, indicators: any): string[] {
  const recommendations: string[] = [];
  
  if (aiScore > 60) {
    recommendations.push("Add more personal anecdotes and experiences to make content more human");
    recommendations.push("Use more conversational language and contractions (I'm, you're, etc.)");
    recommendations.push("Include questions and direct reader engagement");
    recommendations.push("Add some minor grammatical variations and informal expressions");
    recommendations.push("Break up formal sentence structures with shorter, punchier sentences");
  }
  
  if (indicators.repetitivePatterns > 3) {
    recommendations.push("Vary sentence starters and paragraph openings");
  }
  
  if (indicators.formalLanguage > 0.7) {
    recommendations.push("Replace formal terms with more casual, everyday language");
  }
  
  if (indicators.lackOfPersonalTouches < 2) {
    recommendations.push("Include more 'I' statements and personal opinions");
  }
  
  if (indicators.conversationalFlow < 0.3) {
    recommendations.push("Add more questions, exclamations, and direct reader address");
  }
  
  if (aiScore <= 30) {
    recommendations.push("Great! Your content has strong human characteristics");
    recommendations.push("Consider maintaining this natural, conversational style");
  }
  
  return recommendations;
}