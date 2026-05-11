import api from "./api";

export const transactionService = {
  // Get transactions with pagination and filters
  getAll: async ({ userId, page = 1, perPage = 10, startDate, endDate }) => {
    try {
      // Use userId if provided, otherwise use literal "{user_id}" to fetch all
      const uid = userId || "{user_id}";

      const params = {
        page,
        per_page: perPage,
      };

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get(`/transactions/user/${uid}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  // Fetch all pages in parallel (for CSV export)
  getAllPages: async ({ userId, perPage = 10, startDate, endDate }) => {
    try {
      const first = await transactionService.getAll({
        userId,
        page: 1,
        perPage,
        startDate,
        endDate,
      });

      const totalPages = first.total_pages || 1;
      if (totalPages === 1) {
        return first.transactions || [];
      }

      // Fetch remaining pages in parallel
      const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const results = await Promise.all(
        pageNumbers.map((pageNum) =>
          transactionService.getAll({
            userId,
            page: pageNum,
            perPage,
            startDate,
            endDate,
          })
        )
      );

      // Combine all results
      return [
        ...(first.transactions || []),
        ...results.flatMap((r) => r.transactions || []),
      ];
    } catch (error) {
      console.error("Error fetching all transaction pages:", error);
      throw error;
    }
  },

  // Create new transaction
  create: async (data) => {
    try {
      const response = await api.post("/transactions", data);
      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },

  // Update existing transaction
  update: async (id, data) => {
    try {
      const response = await api.put(`/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  // Delete transaction
  remove: async (id) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },

  // Export transactions to Excel
  exportExcel: async ({ userId, startDate, endDate, transactionTypeId }) => {
    try {
      const uid = userId || "{user_id}";
      const params = {};

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (transactionTypeId) params.transaction_type_id = transactionTypeId;

      const response = await api.get(`/transactions/user/${uid}/excel`, {
        params,
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting Excel:", error);
      throw error;
    }
  },
};
