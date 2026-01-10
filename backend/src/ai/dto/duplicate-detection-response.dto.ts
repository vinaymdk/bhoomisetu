export interface DuplicateDetectionResponseDto {
  isDuplicate: boolean;
  confidence: number; // 0-1
  matchingAccounts?: Array<{
    userId: string;
    matchType: 'phone' | 'email' | 'device' | 'ip' | 'payment' | 'name';
    matchScore: number; // 0-1
  }>;
  recommendations: string[];
}
