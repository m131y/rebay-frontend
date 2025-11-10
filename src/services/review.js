import api from "./api";

const reviewService = {
  async getSellerReviews(sellerId) {
    const response = await api.get(`api/review/seller/${sellerId}`);
    console.log("reviewService:", response.data);
    return response.data;
  },

  async createReview(transactionId, formData) {
    const response = await api.post(`api/review/${transactionId}`, formData);
    console.log("reviewService:", response.data);
    return response.data;
  },

  async getReviewsCountByUser(sellerId) {
    const response = await api.get(`api/review/counts/${sellerId}`);
    console.log("reviewService:", response.data);
    return response.data;
  },
};

export default reviewService;
