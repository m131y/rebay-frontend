import { create } from "zustand";
import reviewService from "../services/review";

const useReviewStore = create((set) => ({
  sellerReviews: null,
  ReviewerReviews: null,
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
        error: err.response?.data.message || "Failed to get reviews by seller",
        loading: false,
      });
      throw err;
    }
  },

  getReviewerReviewes: async (reviewerId) => {
    set({ loading: true, error: null });
    try {
      const data = await reviewService.getReviewerReviewes(reviewerId);
      console.log("reviewStore:", data.content);
      set({
        ReviewerReviews: data.content,
        loading: false,
      });
      return data.content;
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to get reviews by reviewr",
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

  updateReview: async (reviewId, formData) => {
    set({ loading: true, error: null });
    try {
      const data = await reviewService.updateReview(reviewId, formData);
      console.log("reviewStore:", data);
      set({
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to update review",
        loading: false,
      });
      throw err;
    }
  },

  deleteReview: async (reviewId) => {
    set({ loading: true, error: null });
    try {
      await reviewService.deleteReview(reviewId);
      set({
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data.message || "Failed to delete review",
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
      set({
        loading: false,
      });
      return data;
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
