import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { productService } from "app/services/productService";
import { interpretApiError } from "app/utils/apiErrorHandler";
import { PRODUCT_TYPES, PRODUCT_DESCRIPTION_OPTIONS } from "app/constants";

export const useProducts = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Main data states
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    typeFilter: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // View mode
  const [viewMode, setViewMode] = useState("grid"); // grid or table

  // Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points: "",
    type_id: "1",
    image: null,
    imagePreview: null,
  });

  // Stock states
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");

  // Loading states
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setFetching(true);
      const data = await productService.getAll({
        page: 1,
        perPage: 1000, // Fetch all for client-side filtering
        typeId: filters.typeFilter || null,
        includeOutOfStock: true,
      });

      const productsList = data.products || [];
      setProducts(productsList);
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "product");
      enqueueSnackbar(message, { variant: "error" });
      console.error("Error fetching products:", error);
    } finally {
      setFetching(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products locally
  useEffect(() => {
    let result = products;

    if (filters.search) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.typeFilter) {
      result = result.filter((product) => product.type_id === Number(filters.typeFilter));
    }

    setFilteredProducts(result);
    setPage(1);
  }, [filters, products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", typeFilter: "" });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleOpenDialog = (mode, product = null) => {
    setDialogMode(mode);
    setSelectedProduct(product);

    if (mode === "create") {
      setFormData({
        name: "",
        description: "",
        points: "",
        type_id: "1",
        image: null,
        imagePreview: null,
      });
    } else if (mode === "edit" && product) {
      setFormData({
        name: product.name,
        description: product.description,
        points: product.points.toString(),
        type_id: product.type_id.toString(),
        image: null,
        imagePreview: product.image_url || null,
      });
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate: PNG only, max 5MB
      if (!file.name.toLowerCase().endsWith(".png")) {
        enqueueSnackbar("Apenas imagens PNG são aceitas", { variant: "warning" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar("Imagem deve ter menos de 5MB", { variant: "warning" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.name || !formData.description || !formData.points) {
        enqueueSnackbar("Preencha todos os campos obrigatórios", { variant: "warning" });
        setLoading(false);
        return;
      }

      if (Number(formData.points) <= 0) {
        enqueueSnackbar("Pontos deve ser maior que 0", { variant: "warning" });
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("points", formData.points);
      formDataToSend.append("type_id", formData.type_id);

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (dialogMode === "create") {
        await productService.create(formDataToSend);
        enqueueSnackbar("Produto criado com sucesso!", { variant: "success" });
      } else if (dialogMode === "edit" && selectedProduct) {
        await productService.update(selectedProduct.id, formDataToSend);
        enqueueSnackbar("Produto atualizado com sucesso!", { variant: "success" });
      }

      handleCloseDialog();
      await fetchProducts();
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "product");
      enqueueSnackbar(message, { variant: "error" });
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    handleOpenDialog("edit", product);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Deseja deletar este produto?")) return;

    try {
      setLoading(true);
      await productService.remove(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      enqueueSnackbar("Produto deletado com sucesso!", { variant: "success" });
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "product");
      enqueueSnackbar(message, { variant: "error" });
      console.error("Error deleting product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStockDialog = (productId) => {
    setStockProductId(productId);
    setStockQuantity("");
    setStockDialogOpen(true);
  };

  const handleCloseStockDialog = () => {
    setStockDialogOpen(false);
    setStockProductId(null);
  };

  const handleUpdateStock = async () => {
    if (!stockProductId || !stockQuantity) {
      enqueueSnackbar("Digite a quantidade", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);
      await productService.updateStock(stockProductId, parseInt(stockQuantity));
      enqueueSnackbar("Estoque atualizado com sucesso!", { variant: "success" });
      handleCloseStockDialog();
      await fetchProducts();
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "product");
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: products.length,
    virtual: products.filter((p) => p.type_id === 1).length,
    physical: products.filter((p) => p.type_id === 2).length,
    totalPoints: products.reduce((sum, p) => sum + p.points, 0),
  };

  return {
    // Data
    products: paginatedProducts,
    filteredProducts,
    filters,
    page,
    totalPages,
    viewMode,
    openDialog,
    dialogMode,
    selectedProduct,
    formData,
    stats,

    // Stock dialog
    stockDialogOpen,
    stockProductId,
    stockQuantity,

    // Loading states
    fetching,
    loading,

    // Handlers
    handleFilterChange,
    handleClearFilters,
    handleViewModeChange,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleImageChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleOpenStockDialog,
    handleCloseStockDialog,
    handleUpdateStock,
    setPage,
    setStockQuantity,
  };
};
