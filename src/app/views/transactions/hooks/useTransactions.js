import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import { transactionService } from "app/services/transactionService";
import { userService } from "app/services/userService";
import { productService } from "app/services/productService";
import { notificationService } from "app/services/notificationService";
import { interpretApiError } from "app/utils/apiErrorHandler";
import { showSuccessPopup, showErrorPopup } from "app/utils/popup";

// Mapeamento: tipo de transação → tipo de produto
const STORE_TYPE_TO_PRODUCT_TYPE = { 7: 1, 8: 2 };

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
  const activeProductTypeIdRef = useRef(null); // tipo de produto ativo no modal

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

  // Busca página de produtos com filtro de tipo (scroll infinito)
  const fetchProductsPage = async (page) => {
    const typeId = activeProductTypeIdRef.current;
    if (!typeId) return;
    try {
      setLoadingProducts(true);
      const data = await productService.getAll({ page, perPage: 10, typeId });
      setProducts((prev) => [
        ...prev,
        ...(data.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          points: p.points,
          type_name: p.type_name,
        })),
      ]);
      setTotalProductsPages(data.total_pages || 1);
      setProductsPage(page);
    } catch (error) {
      console.error("Error fetching products page:", error);
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

  // Busca usuários ao abrir o modal
  useEffect(() => {
    if (openDialog) fetchUsers();
  }, [openDialog]);

  // Recarrega produtos filtrados quando o tipo de transação mudar (loja virtual/física)
  useEffect(() => {
    if (!openDialog) return;

    const productTypeId = STORE_TYPE_TO_PRODUCT_TYPE[Number(formData.typeID)];

    if (!productTypeId) {
      activeProductTypeIdRef.current = null;
      setProducts([]);
      setProductsPage(1);
      setTotalProductsPages(1);
      return;
    }

    activeProductTypeIdRef.current = productTypeId;
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProducts([]);
        setProductsPage(1);
        const data = await productService.getAll({ page: 1, perPage: 10, typeId: productTypeId });
        if (cancelled) return;
        setProducts(
          (data.products || []).map((p) => ({
            id: p.id,
            name: p.name,
            points: p.points,
            type_name: p.type_name,
          }))
        );
        setTotalProductsPages(data.total_pages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Erro ao carregar produtos");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    loadProducts();

    return () => { cancelled = true; };
  }, [openDialog, formData.typeID]);

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
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "typeID" && ![7, 8].includes(Number(value))) {
        updated.productID = "";
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const typeId = Number(formData.typeID);
      const isStoreTransaction = [7, 8].includes(typeId);
      const isPointsGained = [1, 2, 3, 9, 10].includes(typeId);

      // Validação: loja exige produto; demais tipos exigem pontos
      if (!formData.userID || !formData.typeID) {
        toast.warning("Preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }
      if (isStoreTransaction && !formData.productID) {
        toast.warning("Selecione um produto para transações de loja");
        setLoading(false);
        return;
      }
      if (!isStoreTransaction && !formData.points) {
        toast.warning("Preencha todos os campos obrigatórios");
        setLoading(false);
        return;
      }

      const submitData = {
        user_id: parseInt(formData.userID),
        type_id: typeId,
        // Tipos 7 e 8: pontos derivados do produto pela API
        ...(isStoreTransaction ? {} : { points: parseInt(formData.points) }),
        ...(isPointsGained ? {} : { payment_method_id: parseInt(formData.payment_method_id) }),
        product_id: formData.productID ? parseInt(formData.productID) : null,
      };

      if (editingId) {
        await transactionService.update(editingId, submitData);
        toast.success("Transação atualizada com sucesso!");
      } else {
        await transactionService.create(submitData);
        toast.success("Transação criada com sucesso!");

        if (isPointsGained) {
          const formattedPoints = parseInt(formData.points).toLocaleString("pt-BR");
          await notificationService.sendToUser(
            formData.userID,
            "Saldo atualizado",
            `Você recebeu ${formattedPoints} Policoins`
          );
        }
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
    fetchProductsPage,

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
    isPointsGainedType: (typeId) => [1, 2, 3, 9, 10].includes(Number(typeId)),
    isStoreType: (typeId) => [7, 8].includes(Number(typeId)),
    getPointsColor: (points) => (points > 0 ? "success" : "error"),
  };
};
