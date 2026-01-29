export type ReviewType = 'property' | 'seller' | 'experience' | 'deal';
export type ReviewContext = 'after_viewing' | 'after_deal' | 'after_interaction';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'hidden';
export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed';
export type ReportReason = 'fake' | 'spam' | 'inappropriate' | 'offensive' | 'misleading' | 'other';

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName?: string | null;
  revieweeId: string;
  revieweeName?: string | null;
  propertyId?: string | null;
  propertyTitle?: string | null;
  interestExpressionId?: string | null;
  chatSessionId?: string | null;
  reviewType: ReviewType;
  reviewContext?: ReviewContext | null;
  overallRating: number;
  propertyRating?: number | null;
  sellerRating?: number | null;
  responsivenessRating?: number | null;
  communicationRating?: number | null;
  professionalismRating?: number | null;
  title?: string | null;
  comment: string;
  pros?: string | null;
  cons?: string | null;
  sentimentScore?: number | null;
  sentimentLabel?: SentimentLabel | null;
  fakeReviewScore?: number | null;
  fakeReviewDetected: boolean;
  fakeReviewReasons?: string[] | null;
  aiConfidence?: number | null;
  status: ReviewStatus;
  helpfulCount: number;
  notHelpfulCount: number;
  isVerifiedPurchase: boolean;
  isAnonymous: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  hasUserVoted?: boolean;
  userVoteIsHelpful?: boolean;
  repliesCount?: number;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewFilter {
  reviewerId?: string;
  revieweeId?: string;
  propertyId?: string;
  reviewType?: ReviewType;
  reviewContext?: ReviewContext;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
  isVerifiedPurchase?: boolean;
  fakeReviewDetected?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'overallRating' | 'helpfulCount' | 'sentimentScore';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateReviewPayload {
  revieweeId: string;
  propertyId?: string;
  interestExpressionId?: string;
  chatSessionId?: string;
  reviewType: ReviewType;
  reviewContext?: ReviewContext;
  overallRating: number;
  propertyRating?: number;
  sellerRating?: number;
  responsivenessRating?: number;
  communicationRating?: number;
  professionalismRating?: number;
  title?: string;
  comment: string;
  pros?: string;
  cons?: string;
  isAnonymous?: boolean;
}

export interface UpdateReviewPayload {
  overallRating?: number;
  propertyRating?: number;
  sellerRating?: number;
  responsivenessRating?: number;
  communicationRating?: number;
  professionalismRating?: number;
  title?: string;
  comment?: string;
  pros?: string;
  cons?: string;
}

export interface ReportReviewPayload {
  reportReason: ReportReason;
  reportDetails?: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  repliedBy: string;
  replyText: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
