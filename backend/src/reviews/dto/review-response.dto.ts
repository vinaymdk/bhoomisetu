import { ReviewType, ReviewContext, ReviewStatus, SentimentLabel } from '../entities/review.entity';

export class ReviewResponseDto {
  id: string;
  reviewerId: string;
  reviewerName?: string | null; // Only if not anonymous
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
  createdAt: Date;
  updatedAt: Date;
  hasUserVoted?: boolean; // If current user has voted on this review
  userVoteIsHelpful?: boolean; // If current user voted helpful
  repliesCount?: number; // Number of approved replies
}
