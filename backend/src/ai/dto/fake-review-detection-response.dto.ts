export interface FakeReviewDetectionResponseDto {
  fakeReviewScore: number; // 0.0 (genuine) to 1.0 (fake)
  isFake: boolean; // True if fakeReviewScore > threshold (typically 0.7)
  confidence: number; // 0-1
  reasons: string[]; // Reasons for fake detection (e.g., 'generic_language', 'suspicious_pattern', 'duplicate_content', 'unusual_rating', 'timing_anomaly')
  analysis: {
    textPatterns?: {
      genericLanguage: boolean;
      duplicateContent: boolean;
      suspiciousKeywords: boolean;
    };
    ratingAnomalies?: {
      extremeRating: boolean; // 1.0 or 5.0 with generic text
      ratingMismatch: boolean; // Rating doesn't match text sentiment
    };
    behavioralPatterns?: {
      bulkReviewing: boolean; // Multiple reviews in short time
      accountAge: boolean; // Very new account
      unverifiedPurchase: boolean; // No verified purchase/viewing
    };
  };
  recommendations: string[];
}
