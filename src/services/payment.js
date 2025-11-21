import api from "./api";

export const getClientKey = async () => {
  const response = await api.get("/api/payments/client-key");
  return response.data;
};

// export const getAvailableProducts = async () => {
//   const response = await api.get("/api/posts");
//   return response.data;
// };

export const preparePayment = async (postId, buyerId, amount) => {
  const response = await api.post("/api/payments/prepare", {
    postId,
    buyerId,
    amount,
  });

  return response.data;
};

export const confirmPayment = async (paymentKey, orderId, amount) => {
  const response = await api.post("/api/payments/confirm", {
    paymentKey,
    orderId,
    amount,
  });
  return response.data;
};

export const getTransaction = async (transactionId) => {
  const response = await api.get(`/api/transactions/${transactionId}`);
  return response.data;
};

export const confirmReceipt = async (transactionId, buyerId) => {
  const response = await api.post(
    `/api/transactions/${transactionId}/confirm-receipt`,
    null,
    {
      params: { buyerId },
    }
  );
  return response.data;
};

export const getBuyerTransactions = async (buyerId) => {
  const response = await api.get(`/api/transactions/buyer/${buyerId}`);
  return response.data;
};

export const getSellerTransactions = async (sellerId) => {
  const response = await api.get(`/api/transactions/seller/${sellerId}`);
  return response.data;
};

export default api;
