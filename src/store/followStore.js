import { create } from "zustand";
import followService from "../services/follow";

const useFollowStore = create((set) => ({
  followers: null,
  following: null,
  loading: false,
  error: null,

  getFollowers: async (userId, page = 0, size) => {
    set({ loading: true, error: null });
    try {
      const content = await followService.getFollowers(userId, page, size);
      set({
        followers: content,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get followers",
        loading: false,
      });
      throw err;
    }
  },

  getFollowing: async (userId, page = 0, size) => {
    set({ loading: true, error: null });
    try {
      const content = await followService.getFollowing(userId, page, size);
      set({
        following: content,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get following",
        loading: false,
      });
      throw err;
    }
  },

  toggleFollow: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await followService.toggleFollow(userId);
      set({
        loading: false,
      });
      return data;
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to toggle follow",
        loading: false,
      });
      throw err;
    }
  },
}));

export default useFollowStore;
