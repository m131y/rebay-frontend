import api from "./api";

const statisticsService = {
  async getStatisticsByUserProfile(userId) {
    const response = await api.get(`/api/statistics/userProfile/${userId}`);
    return response.data;
  },

  async getTopLikedProductsLastWeek() {
    const response = await api.get(`/api/statistics/popular`);
    return response.data;
  },

  async getDailyTop10Keywords() {
    const response = await api.get(`/api/statistics/top10Keyword`);
    return response.data;
  },

  async getAverageEarningsPerUser() {
    const response = await api.get(`/api/statistics/averageEarning`);
    return response.data;
  },

  async getPersonalizedRecommendations() {
    const response = await api.get(`/api/statistics/personalRecommend`);
    return response.data;
  },
};

export default statisticsService;
