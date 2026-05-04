import api from "./api";

export const productService = {
  // Get products with pagination and filters
  getAll: async ({ page = 1, perPage = 12, typeId, includeOutOfStock = true }) => {
    try {
      const params = {
        page,
        per_page: perPage,
        include_out_of_stock: includeOutOfStock,
      };

      if (typeId) params.type_id = typeId;

      const response = await api.get("/products", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get single product by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Create new product (with image upload)
  create: async (formData) => {
    try {
      const response = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Update existing product (with image upload)
  update: async (id, formData) => {
    try {
      const response = await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Delete product
  remove: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Update product stock
  updateStock: async (productId, quantity) => {
    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      formData.append("quantity", quantity);

      const response = await api.post("/stocks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating stock:", error);
      throw error;
    }
  },
};
