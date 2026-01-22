import apiClient from '../config/api';
import type {
  AuthResponse,
  RequestOtpRequest,
  VerifyOtpRequest,
  SocialLoginRequest,
  AuthTokens,
  User,
} from '../types/auth';

export const authService = {
  async requestOtp(data: RequestOtpRequest): Promise<{ message: string; otp?: string }> {
    const response = await apiClient.post('/auth/otp/request', data);
    return response.data;
  },

  async verifyOtp(data: VerifyOtpRequest & { idToken?: string }): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/otp/verify', {
      ...data,
      // Backend expects idToken from Firebase, not plain OTP
      idToken: data.idToken,
    });
    return response.data;
  },

  async socialLogin(data: SocialLoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/social', data);
    return response.data;
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data.tokens || response.data;
  },

  async getCurrentUser(): Promise<{ user: User; roles: string[] }> {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
