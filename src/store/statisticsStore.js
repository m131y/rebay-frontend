import { create } from "zustand";
import statisticsService from "../services/statistics";

const useStatisticsStore = create((set) => ({
  weeklyTopPosts: [],
  dailyTopKeywords: [],
  userAvgEarnings: null,
  loading: false,
  error: null,

  getStatisticsByUserProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await statisticsService.getStatisticsByUserProfile(userId);
      set({
        loading: false,
      });
      return data;
    } catch (err) {
      set({
        error:
          err.response?.data.message || "Failed to get user Statistics counts",
        loading: false,
      });
      throw err;
    }
  },

  getTopLikedProductsLastWeek: async () => {
    set({ loading: true, error: null });
    try {
      const data = await statisticsService.getTopLikedProductsLastWeek();
      set({
        weeklyTopPosts: data || [],
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get top liked posts",
        loading: false,
      });
      throw err;
    }
  },

  getDailyTop10Keywords: async () => {
    set({ loading: true, error: null });
    try {
      const data = await statisticsService.getDailyTop10Keywords();
      set({
        dailyTopKeywords: data || [],
        loading: false,
      });
      console.log(data);
    } catch (err) {
      set({
        error:
          err.response?.data.message || "Failed to get daily top 10 keywords",
        loading: false,
      });
      throw err;
    }
  },

  getAverageEarningsPerUser: async () => {
    set({ loading: true, error: null });
    try {
      const data = await statisticsService.getAverageEarningsPerUser();
      set({
        userAvgEarnings: data,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get average earnings",
        loading: false,
      });
      throw err;
    }
  },

  getPersonalizedRecommendations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await statisticsService.getPersonalizedRecommendations();
      set({
        loading: false,
      });
      console.log("추천", data);
      return data;
    } catch (err) {
      set({
        error:
          err.response?.data.message ||
          "Failed to get personal recommendation posts",
        loading: false,
      });
      throw err;
    }
  },

  getTradeHistory: async (categoryCode) => {
    set({ loading: true, error: null });
    try {
      const data = await statisticsService.getTradeHistory(categoryCode);
      set({
        loading: false,
      });
      console.log("시세", data);
      return data;
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get trade history",
        loading: false,
      });
      throw err;
    }
  },
}));

export default useStatisticsStore;
