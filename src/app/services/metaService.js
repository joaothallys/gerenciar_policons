import api from "./api";

export const metaService = {
  // Get metas with pagination
  getAll: async ({ page = 1, perPage = 10 } = {}) => {
    try {
      const response = await api.get("/meta", {
        params: {
          page,
          per_page: perPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching metas:", error);
      throw error;
    }
  },

  // Get meta for specific month (format: YYYY-MM)
  getByMonth: async (monthRef) => {
    try {
      const response = await api.get(`/meta/${monthRef}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching meta by month:", error);
      throw error;
    }
  },

  // Fetch all meta pages in parallel
  getAllPages: async () => {
    try {
      const first = await api.get("/meta?page=1&per_page=100");
      const totalPages = first.data.total_pages || 1;
      const firstData = first.data.monthly_metas || [];

      if (totalPages === 1) {
        return {
          items: firstData,
          summary: first.data.summary || null,
        };
      }

      // Fetch remaining pages in parallel
      const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const results = await Promise.all(
        pageNumbers.map((pageNum) => api.get(`/meta?page=${pageNum}&per_page=100`))
      );

      // Combine all results
      const allItems = [
        ...firstData,
        ...results.flatMap((r) => r.data.monthly_metas || []),
      ];

      return {
        items: allItems,
        summary: first.data.summary || null,
      };
    } catch (error) {
      console.error("Error fetching all meta pages:", error);
      throw error;
    }
  },

  // Create new meta
  create: async (monthRef, metaPerc) => {
    try {
      const formData = new FormData();
      formData.append("month_ref", monthRef);
      formData.append("meta_perc", metaPerc);

      const response = await api.post("/meta", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating meta:", error);
      throw error;
    }
  },

  // Update existing meta
  update: async (id, monthRef, metaPerc) => {
    try {
      const formData = new FormData();
      formData.append("month_ref", monthRef);
      formData.append("meta_perc", metaPerc);

      const response = await api.put(`/meta/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating meta:", error);
      throw error;
    }
  },

  // Delete meta
  remove: async (id) => {
    try {
      const response = await api.delete(`/meta/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting meta:", error);
      throw error;
    }
  },
};
