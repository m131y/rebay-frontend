import api from "./api";

const reviewService = {
  async getSellerReviews(sellerId) {
    const response = await api.get(`api/review/seller/${sellerId}`);
    return response.data;
  },

  async getReviewerReviewes(reviewerId) {
    const response = await api.get(`api/review/reviewer/${reviewerId}`);
    return response.data;
  },

  async createReview(transactionId, formData) {
    const response = await api.post(`api/review/${transactionId}`, formData);
    return response.data;
  },

  async updateReview(reviewId, formData) {
    const response = await api.put(`api/review/${reviewId}`, formData);
    return response.data;
  },

  async deleteReview(reviewId) {
    await api.delete(`api/review/${reviewId}`);
  },

  async getReviewsCountByUser(sellerId) {
    const response = await api.get(`api/review/counts/${sellerId}`);
    return response.data;
  },
};

export default reviewService;
