import type { Property } from './property';
import type { User } from './auth';

export type ConnectionStatus =
  | 'pending'
  | 'cs_reviewing'
  | 'seller_checking'
  | 'approved'
  | 'rejected'
  | 'connected';

export type InterestType = 'viewing' | 'offer' | 'negotiation' | 'serious_intent';
export type InterestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface InterestExpression {
  id: string;
  buyerId: string;
  propertyId: string;
  matchId?: string | null;
  message?: string | null;
  interestType: InterestType;
  priority: InterestPriority;
  connectionStatus: ConnectionStatus;
  csReviewed: boolean;
  sellerWillingnessChecked: boolean;
  buyerSeriousnessScore?: number | null;
  sellerWillingnessScore?: number | null;
  createdAt: string;
  updatedAt: string;
  buyer?: User;
  property?: Property & { seller?: User | null };
}

export interface MediationListResponse {
  interests: InterestExpression[];
  total: number;
  page: number;
  limit: number;
}

