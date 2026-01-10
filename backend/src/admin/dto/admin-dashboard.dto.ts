export interface AdminDashboardStatsDto {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  // Property Statistics
  totalProperties: number;
  liveProperties: number;
  pendingVerificationProperties: number;
  rejectedProperties: number;
  featuredProperties: number;

  // CS Activity Statistics
  totalCSActions: number;
  csActionsToday: number;
  pendingMediations: number;
  completedMediations: number;

  // Payment Statistics
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  failedPayments: number;
  fraudulentPayments: number;

  // AI Performance Statistics
  aiFraudChecksTotal: number;
  aiFraudChecksToday: number;
  aiFraudScoreAverage: number;
  aiSentimentAnalysisTotal: number;
  aiFakeReviewDetectionsTotal: number;
  aiFakeReviewDetectionsToday: number;
  aiFakeReviewScoreAverage: number;

  // Review Statistics
  totalReviews: number;
  approvedReviews: number;
  flaggedReviews: number;
  averageRating: number;

  // Buyer Requirements Statistics
  totalBuyerRequirements: number;
  activeBuyerRequirements: number;
  totalMatches: number;
}
