import { create } from "zustand";
import userService from "../services/user";

const useUserStore = create((set) => ({
  userProfile: null,
  searchHistory: [],
  loading: false,
  error: null,

  getUserProfile: async (userId) => {
    set({ loading: true, error: null });
    try {
      const userProfile = await userService.getUserProfile(userId);
      console.log("userStore:", userProfile);
      set({
        userProfile,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get userprofile",
        loading: false,
      });
      throw err;
    }
  },

  updateProfile: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await userService.updateProfile(userData);
      console.log("userService:", data);
      return data;
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to update userprofile",
        loading: false,
      });
      throw err;
    }
  },

  updatePassword: async (passwordData) => {
    set({ loading: true, error: null });
    try {
      await userService.updatePassword(passwordData);
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to update password",
        loading: false,
      });
      throw err;
    }
  },

  getSearchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const data = await userService.getSearchHistory();
      set({ searchHistory: data });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get search history",
        loading: false,
      });
      throw err;
    }
  },
}));

export default useUserStore;
