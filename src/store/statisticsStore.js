import { create } from "zustand";
import statisticsService from "../services/statistics";

const useStatisticsStore = create((set) => ({
  loading: false,
  error: null,

  getStatisticsByUserProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await statisticsService.getStatisticsByUserProfile(userId);
      console.log("statisticsStore:", data);
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
}));

export default useStatisticsStore;
