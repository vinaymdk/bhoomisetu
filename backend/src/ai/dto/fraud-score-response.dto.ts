export interface FraudScoreResponseDto {
  riskScore: number; // 0-100, where 0 is safe, 100 is high risk
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[]; // List of risk factors identified
  recommendations: string[]; // Recommended actions
  shouldBlock: boolean; // Whether to block the request
  shouldRequireManualReview: boolean; // Whether CS should review
  confidence: number; // 0-1, confidence in the assessment
}
