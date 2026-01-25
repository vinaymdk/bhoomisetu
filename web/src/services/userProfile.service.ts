import apiClient from '../config/api';
import type { User } from '../types/auth';

export interface UpdateProfilePayload {
  fullName?: string;
  primaryPhone?: string;
  primaryEmail?: string;
  address?: string;
  avatarUrl?: string;
}

export const userProfileService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.patch('/users/me', payload);
    return response.data as User;
  },
  async uploadAvatar(file: File): Promise<string> {
    const form = new FormData();
    form.append('avatar', file);
    const response = await apiClient.post('/users/me/avatar', form);
    return response.data.avatarUrl as string;
  },
};

