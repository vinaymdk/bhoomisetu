export interface SessionRiskResponseDto {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[]; // e.g., "Location jump detected", "New device", "Unusual IP"
  shouldRequireVerification: boolean; // Whether to require additional verification
  shouldBlock: boolean; // Whether to block the session
  recommendations: string[];
  confidence: number; // 0-1
}
