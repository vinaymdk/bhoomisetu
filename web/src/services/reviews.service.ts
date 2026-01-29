import apiClient from '../config/api';
import type {
  Review,
  ReviewFilter,
  ReviewListResponse,
  CreateReviewPayload,
  UpdateReviewPayload,
  ReportReviewPayload,
  ReviewReply,
} from '../types/review';

export const reviewsService = {
  async list(filter: ReviewFilter = {}): Promise<ReviewListResponse> {
    const response = await apiClient.get('/reviews', { params: filter });
    return response.data;
  },

  async listMine(filter: ReviewFilter = {}): Promise<ReviewListResponse> {
    const response = await apiClient.get('/reviews/mine', { params: filter });
    return response.data;
  },

  async getByProperty(propertyId: string, filter: ReviewFilter = {}): Promise<ReviewListResponse> {
    const response = await apiClient.get(`/reviews/property/${propertyId}`, { params: filter });
    return response.data;
  },

  async getBySeller(revieweeId: string, filter: ReviewFilter = {}): Promise<ReviewListResponse> {
    const response = await apiClient.get(`/reviews/seller/${revieweeId}`, { params: filter });
    return response.data;
  },

  async getById(id: string): Promise<Review> {
    const response = await apiClient.get(`/reviews/${id}`);
    return response.data;
  },

  async create(payload: CreateReviewPayload): Promise<Review> {
    const response = await apiClient.post('/reviews', payload);
    return response.data;
  },

  async update(id: string, payload: UpdateReviewPayload): Promise<Review> {
    const response = await apiClient.patch(`/reviews/${id}`, payload);
    return response.data;
  },

  async voteHelpful(id: string, isHelpful: boolean): Promise<void> {
    await apiClient.post(`/reviews/${id}/helpful`, { isHelpful });
  },

  async report(id: string, payload: ReportReviewPayload): Promise<void> {
    await apiClient.post(`/reviews/${id}/report`, payload);
  },

  async reply(id: string, replyText: string): Promise<ReviewReply> {
    const response = await apiClient.post(`/reviews/${id}/reply`, { replyText });
    return response.data;
  },
};
