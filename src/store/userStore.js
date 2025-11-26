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
      set({
        userProfile,
        loading: false,
      });
      console.log(userProfile);
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
      set({
        loading: false,
      });
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
      set({
        loading: false,
      });
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
      set({ loading: false, searchHistory: data });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get search history",
        loading: false,
      });
      throw err;
    }
  },

  findPassword: async (LoginData) => {
    set({ loading: true, error: null });
    try {
      const data = await userService.findPassword(LoginData);
      set({
        loading: false,
      });
      return data;
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to find password",
        loading: false,
      });
      throw err;
    }
  },

  resetPassword: async (passwordData) => {
    set({ loading: true, error: null });
    try {
      const data = await userService.resetPassword(passwordData);
      set({
        loading: false,
      });
      return data;
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to reset password",
        loading: false,
      });
      throw err;
    }
  },
}));

export default useUserStore;
