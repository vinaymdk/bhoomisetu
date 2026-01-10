export enum SentimentLabel {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  MIXED = 'mixed',
}

export interface SentimentAnalysisResponseDto {
  sentimentScore: number; // -1.0 (negative) to 1.0 (positive)
  sentimentLabel: SentimentLabel;
  confidence: number; // 0-1
  keyPhrases: string[]; // Key phrases extracted from review
  topics: string[]; // Topics identified (e.g., 'price', 'location', 'condition')
  analysis: {
    positiveAspects?: string[];
    negativeAspects?: string[];
    suggestions?: string[];
  };
}
