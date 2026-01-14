import apiClient from '../config/api';
import type { HomeData, DashboardData } from '../types/property';

export const homeService = {
  async getHomeData(featuredLimit = 10, newLimit = 10): Promise<HomeData> {
    const response = await apiClient.get('/home', {
      params: { featuredLimit, newLimit },
    });
    return response.data;
  },

  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/home/dashboard');
    return response.data;
  },
};
