export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalProperties: number;
  liveProperties: number;
  pendingVerificationProperties: number;
  rejectedProperties: number;
  featuredProperties: number;
  totalCSActions: number;
  csActionsToday: number;
  pendingMediations: number;
  completedMediations: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  failedPayments: number;
  fraudulentPayments: number;
  aiFraudChecksTotal: number;
  aiFraudChecksToday: number;
  aiFraudScoreAverage: number;
  aiSentimentAnalysisTotal: number;
  aiFakeReviewDetectionsTotal: number;
  aiFakeReviewDetectionsToday: number;
  aiFakeReviewScoreAverage: number;
  totalReviews: number;
  approvedReviews: number;
  flaggedReviews: number;
  averageRating: number;
  totalBuyerRequirements: number;
  activeBuyerRequirements: number;
  totalMatches: number;
}

export interface AdminUserRole {
  role: {
    code: string;
    name?: string;
  };
}

export interface AdminUser {
  id: string;
  fullName?: string | null;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  status?: string;
  fraudRiskScore?: number | null;
  createdAt?: string;
  userRoles?: AdminUserRole[];
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminPendingPropertiesResponse {
  properties: Array<Record<string, any>>;
  total: number;
  page: number;
  limit: number;
}

export interface AdminPaymentReportResponse {
  payments: Array<Record<string, any>>;
  total: number;
  page: number;
  limit: number;
  summary?: {
    totalAmount?: number;
    completedCount?: number;
    failedCount?: number;
    totalCount?: number;
  };
}

export interface AdminAiMetricsResponse {
  metricType: string;
  summary: Record<string, any>;
  data: Array<Record<string, any>>;
}

export interface AdminFlaggedReviewsResponse {
  reviews: Array<Record<string, any>>;
  total: number;
  page: number;
  limit: number;
}

export interface AdminReviewReportsResponse {
  reports: Array<Record<string, any>>;
  total: number;
  page: number;
  limit: number;
}

export interface AdminCsLogsResponse {
  logs: Array<Record<string, any>>;
  total: number;
  page: number;
  limit: number;
}
