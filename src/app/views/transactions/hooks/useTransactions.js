import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { transactionService } from "app/services/transactionService";
import { userService } from "app/services/userService";
import { productService } from "app/services/productService";
import { interpretApiError } from "app/utils/apiErrorHandler";
import { showSuccessPopup, showErrorPopup } from "app/utils/popup";

export const useTransactions = () => {// Main data states
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [transactionProductsById, setTransactionProductsById] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    userID: "",
    typeID: "",
    points: "",
    payment_method_id: "",
    productID: "",
  });

  // Loading states
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFilterUsers, setLoadingFilterUsers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  // Export modal states
  const [openExportDialog, setOpenExportDialog] = useState(false);

  // Modal data states
  const [filterUsers, setFilterUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsPage, setProductsPage] = useState(1);
  const [totalProductsPages, setTotalProductsPages] = useState(1);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setFetching(true);
      const data = await transactionService.getAll({
        userId: filters.userId || null,
        page,
        perPage: itemsPerPage,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
      });

      const rawTransactions = data.transactions || [];

      // Fetch missing product names
      const productIds = [
        ...new Set(
          rawTransactions
            .map((t) => Number(t.product_id))
            .filter((id) => Number.isInteger(id) && id > 0)
        ),
      ];

      const missingProductIds = productIds.filter((id) => !transactionProductsById[id]);
      let fetchedProductsById = {};

      if (missingProductIds.length > 0) {
        const productResponses = await Promise.all(
          missingProductIds.map(async (productId) => {
            try {
              const productData = await productService.getById(productId);
              return {
                id: productId,
                name: productData?.name || "-",
              };
            } catch (error) {
              console.error(`Error fetching product ${productId}:`, error);
              return null;
            }
          })
        );

        fetchedProductsById = productResponses.reduce((acc, item) => {
          if (item?.id) {
            acc[item.id] = item.name;
          }
          return acc;
        }, {});

        if (Object.keys(fetchedProductsById).length > 0) {
          setTransactionProductsById((prev) => ({ ...prev, ...fetchedProductsById }));
        }
      }

      const productsById = { ...transactionProductsById, ...fetchedProductsById };

      // Map API response to expected format
      const mapped = rawTransactions.map((t) => ({
        id: t.id,
        userID: t.user_id || t.user?.id || "",
        userName: t.user?.username || `Usuário ${t.user_id}`,
        userEmail: t.user?.email || "",
        typeID: t.type_id || t.type?.id || t.type?.type_id,
        type_name: (t.type && t.type.name) || t.type_name || "",
        points: t.points || 0,
        created_at: t.created_at ? t.created_at.split("T")[0] : "",
        payment_method_id: t.payment_method_id || t.payment_method?.id || 1,
        payment_method_name: t.payment_method?.name || "",
        productID: t.product_id || null,
        productName: t.product?.name || productsById[t.product_id] || "-",
      }));

      setTransactions(mapped);
      setSummary(data.summary || null);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      const message = interpretApiError(error.message, error.response?.status, "transaction");
      toast.error(message);
    } finally {
      setFetching(false);
    }
  };

  // Fetch filter users list
  const fetchFilterUsers = async () => {
    try {
      setLoadingFilterUsers(true);
      const data = await userService.getAll();
      const usersList = (data.users || data || []).map((u) => ({
        id: u.id,
        name: u.username || u.name || `Usuário ${u.id}`,
        username: u.username,
        email: u.email,
      }));
      setFilterUsers(usersList);
    } catch (error) {
      console.error("Error fetching filter users:", error);
    } finally {
      setLoadingFilterUsers(false);
    }
  };

  // Fetch users for modal select
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await userService.getAll();
      const usersList = (data.users || data || []).map((u) => ({
        id: u.id,
        name: u.username || u.name || `Usuário ${u.id}`,
        username: u.username,
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch products with pagination
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productService.getAll({
        page: productsPage,
        perPage: 10,
      });

      const productsList = (data.products || []).map((p) => ({
        id: p.id,
        name: p.name,
        points: p.points,
        type_name: p.type_name,
      }));

      setProducts((prev) => [...prev, ...productsList]);
      setTotalProductsPages(data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchTransactions();
  }, [page, filters.userId, filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchFilterUsers();
  }, []);

  useEffect(() => {
    if (openDialog) {
      fetchUsers();
      setProducts([]);
      setProductsPage(1);
    }
  }, [openDialog]);

  useEffect(() => {
    if (openDialog && productsPage <= totalProductsPages) {
      fetchProducts();
    }
  }, [openDialog, productsPage]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleOpenDialog = () => {
    setFormData({
      userID: "",
      typeID: "",
      points: "",
      payment_method_id: "",
      productID: "",
    });
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.userID || !formData.typeID || !formData.points) {
        toast.warning("Preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }

      const submitData = {
        user_id: parseInt(formData.userID),
        type_id: parseInt(formData.typeID),
        points: parseInt(formData.points),
        payment_method_id: parseInt(formData.payment_method_id),
        product_id: formData.productID ? parseInt(formData.productID) : null,
      };

      if (editingId) {
        await transactionService.update(editingId, submitData);
        toast.success("Transação atualizada com sucesso!");
      } else {
        await transactionService.create(submitData);
        toast.success("Transação criada com sucesso!");
      }

      handleCloseDialog();
      await fetchTransactions();
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "transaction");
      toast.error(message);
      console.error("Error saving transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      userID: transaction.userID,
      typeID: transaction.typeID,
      points: transaction.points,
      payment_method_id: transaction.payment_method_id || "",
      productID: transaction.productID || "",
    });
    setEditingId(transaction.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja deletar esta transação?")) return;

    try {
      setLoading(true);
      await transactionService.remove(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transação deletada com sucesso!");
      showSuccessPopup("Transação deletada com sucesso!", "Transação removida");
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "transaction");
      toast.error(message);
      showErrorPopup(message, "Falha ao deletar transação");
      console.error("Error deleting transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions by search text
  const filteredTransactions = transactions.filter((t) => {
    if (
      filters.search &&
      !t.userID.toString().includes(filters.search) &&
      !t.userName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !t.type_name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !t.productName.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculate statistics
  const displayStats = summary
    ? {
        totalPoints: summary.points_sum || 0,
        gainedPoints: summary.points_gain || 0,
        spentPoints: summary.points_spent || 0,
        transactionCount: summary.total || transactions.length,
      }
    : {
        totalPoints: transactions.reduce((sum, t) => sum + t.points, 0),
        gainedPoints: transactions
          .filter((t) => t.points > 0)
          .reduce((sum, t) => sum + t.points, 0),
        spentPoints: transactions
          .filter((t) => t.points < 0)
          .reduce((sum, t) => sum + Math.abs(t.points), 0),
        transactionCount: transactions.length,
      };

  return {
    // Data
    transactions: filteredTransactions,
    summary: displayStats,
    filters,
    page,
    totalPages,
    openDialog,
    editingId,
    formData,

    // Lists
    filterUsers,
    users,
    products,
    productsPage,
    totalProductsPages,

    // Loading states
    fetching,
    loading,
    loadingFilterUsers,
    loadingUsers,
    loadingProducts,
    exportingCsv,

    // Export modal states
    openExportDialog,
    setOpenExportDialog,

    // Handlers
    handleFilterChange,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    setPage,
    setExportingCsv,
    setProductsPage,
    setTransactionProductsById,
    fetchTransactions,

    // Export handler
    handleExportTransactions: async (exportFilters) => {
      try {
        setExportingCsv(true);
        const { exportTransactionsToCsv } = await import("../utils/exportCsv");
        const result = await exportTransactionsToCsv({
          userId: exportFilters.userId || null,
          startDate: exportFilters.startDate || null,
          endDate: exportFilters.endDate || null,
          transactionTypeId: exportFilters.transactionTypeId || null,
        });
        console.log(result.message);
      } catch (error) {
        console.error("Export failed:", error);
        showErrorPopup("Erro ao exportar transações", error?.message);
      } finally {
        setExportingCsv(false);
      }
    },

    // Helpers
    isPointsGainedType: (typeId) => [1, 2, 3].includes(Number(typeId)),
    getPointsColor: (points) => (points > 0 ? "success" : "error"),
  };
};
