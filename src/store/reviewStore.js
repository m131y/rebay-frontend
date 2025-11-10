import { create } from "zustand";
import reviewService from "../services/review";

const useReviewStore = create((set) => ({
  sellerReviews: null,
  loading: false,
  error: null,

  getSellerReviews: async (sellerId) => {
    set({ loading: true, error: null });
    try {
      const data = await reviewService.getSellerReviews(sellerId);
      console.log("reviewStore:", data.content);
      set({
        sellerReviews: data.content,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get seller reviews",
        loading: false,
      });
      throw err;
    }
  },
  createReview: async (transactionId, formData) => {
    set({ loading: true, error: null });
    try {
      const data = await reviewService.createReview(transactionId, formData);
      console.log("reviewStore:", data.content);
      set({
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get seller reviews",
        loading: false,
      });
      throw err;
    }
  },

  getReviewsCountByUser: async (sellerId) => {
    set({ loading: true, error: null });
    try {
      const data = await reviewService.getReviewsCountByUser(sellerId);
      console.log("reviewStore:", data);
      return data;
      set({
        loading: false,
      });
    } catch (err) {
      set({
        error:
          err.response?.data.message || "Failed to get seller review counts",
        loading: false,
      });
      throw err;
    }
  },
}));

export default useReviewStore;
