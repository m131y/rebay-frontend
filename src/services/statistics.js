import api from "./api";

const statisticsService = {
  async getStatisticsByUserProfile(userId) {
    const response = await api.get(`api/statistics/userProfile/${userId}`);
    return response.data;
  },
};

export default statisticsService;
