import type { Property } from './property';

export type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';

export interface CsSeller {
  id: string;
  fullName?: string | null;
  primaryPhone?: string | null;
  primaryEmail?: string | null;
}

export interface VerificationNote {
  id?: string;
  urgencyLevel?: UrgencyLevel;
  negotiationNotes?: string | null;
  remarks?: string | null;
  verifiedAt?: string;
  csAgentId?: string;
}

export interface PendingVerificationProperty {
  property: Property;
  seller: CsSeller;
  verificationNotes?: VerificationNote[];
}

export interface PendingVerificationResponse {
  properties: PendingVerificationProperty[];
  total: number;
  page: number;
  limit: number;
}

export interface CsStats {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
}

export interface VerifyPropertyPayload {
  propertyId: string;
  urgencyLevel: UrgencyLevel;
  negotiationNotes?: string;
  remarks?: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}
