import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Breadcrumb, SimpleCard } from "app/components";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  [theme.breakpoints.down("xs")]: { margin: "8px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const FilterCard = styled(Card)(({ theme }) => ({
  padding: "20px",
  marginBottom: "30px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: "16px",
    marginBottom: "20px",
  },
  [theme.breakpoints.down("xs")]: {
    padding: "12px",
    marginBottom: "16px",
  },
}));

const TransactionTable = styled(TableContainer)(({ theme }) => ({
  marginBottom: "30px",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
  "& .MuiTableHead-root": {
    "& .MuiTableCell-head": {
      backgroundColor: "#f5f5f5",
      fontWeight: 600,
      color: "#1a1a1a",
      borderBottom: "2px solid #e0e0e0",
      fontSize: "14px",
    },
  },
  "& .MuiTableBody-root": {
    "& .MuiTableRow-root": {
      "&:hover": {
        backgroundColor: "#fafafa",
      },
      "& .MuiTableCell-body": {
        fontSize: "14px",
      },
    },
  },
}));

const TransactionCard = styled(Card)(({ theme }) => ({
  padding: "16px",
  marginBottom: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  borderRadius: "12px",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
  },
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

const MobileCardsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("md")]: {
    display: "block",
  },
}));

const StatisticCard = styled(Paper)(({ theme }) => ({
  padding: "20px",
  textAlign: "center",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  "& .stat-value": {
    fontSize: "28px",
    fontWeight: 700,
    marginTop: "10px",
  },
  "& .stat-label": {
    fontSize: "12px",
    fontWeight: 500,
    opacity: 0.9,
    marginTop: "5px",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "16px",
    "& .stat-value": {
      fontSize: "20px",
      marginTop: "8px",
    },
    "& .stat-label": {
      fontSize: "11px",
      marginTop: "4px",
    },
  },
  [theme.breakpoints.down("xs")]: {
    padding: "12px",
    "& .stat-value": {
      fontSize: "18px",
      marginTop: "6px",
    },
    "& .stat-label": {
      fontSize: "10px",
      marginTop: "3px",
    },
  },
}));

// Mock data - será substituído por requisições reais
const TRANSACTION_TYPES = [
  { id: 1, name: "Pontos Ganhos - Meta" },
  { id: 2, name: "Pontos Ganhos - Trimestral" },
  { id: 3, name: "Pontos Ganhos - Jogos" },
  { id: 4, name: "Pontos Perdidos - Frequência" },
  { id: 5, name: "Pontos Perdidos - Organização" },
  { id: 6, name: "Pontos Perdidos - Trimestral" },
  { id: 7, name: "Pontos Gastos - Loja Virtual" },
  { id: 8, name: "Pontos Gastos - Loja Física" },
];

const PAYMENT_METHODS = [
  { id: 2, name: "Policoins" },
  { id: 1, name: "Desconto em folha" },
];

export default function TransactionsPage() {
  const { enqueueSnackbar } = useSnackbar();

  // Estado para dados vindos da API
  const [fetching, setFetching] = useState(false);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsPage, setProductsPage] = useState(1);
  const [totalProductsPages, setTotalProductsPages] = useState(1);

  // Estados para filtro de usuários
  const [filterUsers, setFilterUsers] = useState([]);
  const [loadingFilterUsers, setLoadingFilterUsers] = useState(false);

  // Estados de Filtro
  const [filters, setFilters] = useState({
    search: "",
    userId: "",
    startDate: "",
    endDate: "",
  });

  // Estados de Paginação
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);

  // Estados do Formulário Modal
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    userID: "",
    typeID: "",
    points: "",
    payment_method_id: "",
    productID: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper simples para decodificar payload do JWT sem depender de libs
  function parseJwt(token) {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(decodeURIComponent(atob(payload).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join("")));
      return decoded;
    } catch (e) {
      return null;
    }
  }

  // Busca transações do usuário usando token em localStorage
  const fetchTransactions = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      enqueueSnackbar("Token não encontrado no cache. Faça login novamente.", { variant: "warning" });
      return;
    }

    const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;

    // Se tiver filtro de usuário selecionado, usar esse ID específico
    // Se não tiver filtro, usar o placeholder literal "{user_id}" para buscar todos
    const userId = filters.userId || "{user_id}";

    // Construir URL com parâmetros de data se fornecidos
    let url = `${apiHost}/transactions/user/${userId}?page=${page}&per_page=${itemsPerPage}`;
    if (filters.startDate) {
      url += `&start_date=${filters.startDate}`;
    }
    if (filters.endDate) {
      url += `&end_date=${filters.endDate}`;
    }

    try {
      setFetching(true);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        enqueueSnackbar(`Erro ao buscar transações: ${res.status}`, { variant: "error" });
        setFetching(false);
        return;
      }

      const json = await res.json();

      // Mapear estrutura da API para o formato esperado pela tabela
      const mapped = (json.transactions || []).map((t) => ({
        id: t.id,
        userID: t.user_id || t.user?.id || "",
        userName: t.user?.username || `Usuário ${t.user_id}`,
        userEmail: t.user?.email || "",
        typeID: t.type_id || t.type?.id || t.type?.type_id,
        type_name: (t.type && t.type.name) || t.type_name || "",
        points: t.points || 0,
        created_at: t.created_at ? t.created_at.split("T")[0] : (t.created_at || ""),
        payment_method_id: t.payment_method_id || t.payment_method?.id || 1,
        payment_method_name: t.payment_method?.name || "",
        productID: t.product_id || null,
        productName: t.product?.name || "-",
        responsibleID: t.responsible_id || null,
        responsibleName: t.responsible?.username || "-",
      }));

      setTransactions(mapped);
      setSummary(json.summary || null);
      setTotalPages(json.total_pages || 1);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      enqueueSnackbar("Erro ao buscar transações. Verifique o servidor.", { variant: "error" });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, filters.userId, filters.startDate, filters.endDate]);

  // Buscar usuários para o filtro
  useEffect(() => {
    async function fetchFilterUsers() {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;

      try {
        setLoadingFilterUsers(true);
        const res = await fetch(`${apiHost}/users`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error(`Erro ao buscar usuários para filtro: ${res.status}`);
          setLoadingFilterUsers(false);
          return;
        }

        const json = await res.json();
        const usersList = (json.users || json || []).map((u) => ({
          id: u.id,
          name: u.username || u.name || `Usuário ${u.id}`,
          username: u.username,
          email: u.email,
        }));
        setFilterUsers(usersList);
      } catch (error) {
        console.error("Erro ao buscar usuários para filtro:", error);
      } finally {
        setLoadingFilterUsers(false);
      }
    }

    fetchFilterUsers();
  }, []);

  // Buscar usuários para o select do modal
  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;

      try {
        setLoadingUsers(true);
        const res = await fetch(`${apiHost}/users`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error(`Erro ao buscar usuários: ${res.status}`);
          setLoadingUsers(false);
          return;
        }

        const json = await res.json();
        const usersList = (json.users || json || []).map((u) => ({
          id: u.id,
          name: u.username || u.name || `Usuário ${u.id}`,
          username: u.username,
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoadingUsers(false);
      }
    }

    if (openDialog) {
      fetchUsers();
      // Resetar produtos ao abrir modal
      setProducts([]);
      setProductsPage(1);
    }
  }, [openDialog]);

  // Buscar produtos com scroll paginado
  useEffect(() => {
    async function fetchProducts() {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;

      try {
        setLoadingProducts(true);
        const res = await fetch(`${apiHost}/products?page=${productsPage}&per_page=10`, {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error(`Erro ao buscar produtos: ${res.status}`);
          setLoadingProducts(false);
          return;
        }

        const json = await res.json();
        const productsList = (json.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          points: p.points,
          type_name: p.type_name,
        }));

        // Adicionar novos produtos à lista existente (para paginação infinita)
        setProducts((prev) => [...prev, ...productsList]);
        setTotalProductsPages(json.total_pages || 1);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoadingProducts(false);
      }
    }

    if (openDialog && productsPage <= totalProductsPages) {
      fetchProducts();
    }
  }, [openDialog, productsPage]);

  // Handlers para Filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Handlers para Formulário
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
      // Validação básica
      if (!formData.userID || !formData.typeID || !formData.points) {
        enqueueSnackbar("Preencha todos os campos obrigatórios", {
          variant: "warning",
        });
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        enqueueSnackbar("Token não encontrado. Faça login novamente.", { variant: "warning" });
        setLoading(false);
        return;
      }

      const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;

      if (editingId) {
        // Editar transação via API (PUT)
        const editData = {
          user_id: parseInt(formData.userID),
          type_id: parseInt(formData.typeID),
          points: parseInt(formData.points),
          payment_method_id: parseInt(formData.payment_method_id),
          product_id: formData.productID ? parseInt(formData.productID) : null,
        };

        const res = await fetch(`${apiHost}/transactions/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        });

        if (!res.ok) {
          const error = await res.text();
          enqueueSnackbar(`Erro ao atualizar transação: ${res.status}`, { variant: "error" });
          console.error("Erro:", error);
          setLoading(false);
          return;
        }

        await res.json();
        enqueueSnackbar("Transação atualizada com sucesso!", {
          variant: "success",
        });

        // Recarregar transações da API
        await fetchTransactions();
      } else {
        // Criar transação via API (POST)
        const createData = {
          user_id: parseInt(formData.userID),
          type_id: parseInt(formData.typeID),
          points: parseInt(formData.points),
          payment_method_id: parseInt(formData.payment_method_id),
          product_id: formData.productID ? parseInt(formData.productID) : null,
        };

        const res = await fetch(`${apiHost}/transactions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createData),
        });

        if (!res.ok) {
          const error = await res.text();
          enqueueSnackbar(`Erro ao criar transação: ${res.status}`, { variant: "error" });
          console.error("Erro:", error);
          setLoading(false);
          return;
        }

        await res.json();
        enqueueSnackbar("Transação criada com sucesso!", { variant: "success" });

        // Recarregar transações da API
        await fetchTransactions();
      }

      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar("Erro ao salvar transação", { variant: "error" });
      console.error("Erro:", error);
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

  const handleDelete = (id) => {
    if (window.confirm("Deseja deletar esta transação?")) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      enqueueSnackbar("Transação deletada com sucesso!", { variant: "success" });
    }
  };

  // Filtrar transações (sem paginação, pois já vem da API)
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

  // Usar summary da API quando disponível, caso contrário calcular localmente
  const displayStats = summary ? {
    totalPoints: summary.points_sum || 0,
    gainedPoints: summary.points_gain || 0,
    spentPoints: summary.points_spent || 0,
    transactionCount: summary.total || transactions.length,
  } : {
    totalPoints: transactions.reduce((sum, t) => sum + t.points, 0),
    gainedPoints: transactions.filter((t) => t.points > 0).reduce((sum, t) => sum + t.points, 0),
    spentPoints: transactions.filter((t) => t.points < 0).reduce((sum, t) => sum + Math.abs(t.points), 0),
    transactionCount: transactions.length,
  };

  const getPointsColor = (points) => {
    return points > 0 ? "success" : "error";
  };

  // Verificar se o tipo selecionado é "Pontos Ganhos"
  const isPointsGainedType = (typeId) => {
    return [1, 2, 3].includes(parseInt(typeId));
  };

  // Handler para scroll infinito no Select de produtos
  const handleProductsScroll = (event) => {
    const listboxNode = event.currentTarget;
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) {
      // Usuário scrollou até o final, carregar próxima página
      if (productsPage < totalProductsPages && !loadingProducts) {
        setProductsPage((prev) => prev + 1);
      }
    }
  };

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Dashboard", path: "/dashboard/default" },
            { name: "Transações" },
          ]}
        />
      </Box>

      {/* Cartões de Estatísticas */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard elevation={0}>
            <div className="stat-label">SALDO TOTAL</div>
            <div className="stat-value">{displayStats.totalPoints.toLocaleString()}</div>
            <div className="stat-label">Policoins</div>
          </StatisticCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            }}
          >
            <div className="stat-label">GANHOS</div>
            <div className="stat-value">{displayStats.gainedPoints.toLocaleString()}</div>
            <div className="stat-label">Total de pontos</div>
          </StatisticCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
            }}
          >
            <div className="stat-label">GASTOS</div>
            <div className="stat-value">{displayStats.spentPoints.toLocaleString()}</div>
            <div className="stat-label">Total de pontos</div>
          </StatisticCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatisticCard
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            }}
          >
            <div className="stat-label">TRANSAÇÕES</div>
            <div className="stat-value">{displayStats.transactionCount}</div>
            <div className="stat-label">Total registradas</div>
          </StatisticCard>
        </Grid>
      </Grid>

      {/* Filtros */}
      <FilterCard>
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              size="small"
              label="Buscar"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Nome, tipo, produto..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Select
              fullWidth
              size="small"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              displayEmpty
              disabled={loadingFilterUsers}
            >
              <MenuItem value="">
                {loadingFilterUsers ? "Carregando..." : "Todos os Usuários"}
              </MenuItem>
              {filterUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Data Início"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Data Fim"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                fontSize: { xs: "12px", sm: "14px" },
                padding: { xs: "8px 12px", sm: "10px 16px" },
              }}
            >
              Nova Transação
            </Button>
          </Grid>
        </Grid>
      </FilterCard>

      {/* Tabela de Transações */}
      <SimpleCard title="Histórico de Transações">
        {/* Tabela para Desktop */}
        <TransactionTable>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell align="center">Pontos</TableCell>
                <TableCell align="center">Método de Pagamento</TableCell>
                <TableCell>Responsável</TableCell>
                <TableCell align="center">Data</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fetching ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Box>
                        <Box sx={{ fontWeight: 600, fontSize: "14px" }}>
                          {transaction.userName}
                        </Box>
                        <Box sx={{ fontSize: "12px", color: "text.secondary" }}>
                          {transaction.userEmail}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ fontSize: "13px" }}>
                        {transaction.type_name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ fontSize: "13px", color: transaction.productID ? "text.primary" : "text.secondary" }}>
                        {transaction.productName}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={transaction.points.toLocaleString()}
                        color={getPointsColor(transaction.points)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Chip
                          label={transaction.payment_method_name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "12px" }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ fontSize: "13px" }}>
                        {transaction.responsibleName}
                      </Box>
                    </TableCell>
                    <TableCell align="center">{transaction.created_at}</TableCell>
                    <TableCell align="center">
                      <Box sx={{
                        display: "flex",
                        gap: { xs: 0.5, sm: 1 },
                        justifyContent: "center",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon fontSize="small" />}
                          onClick={() => handleEdit(transaction)}
                          sx={{
                            fontSize: { xs: "10px", sm: "13px" },
                            padding: { xs: "3px 6px", sm: "5px 10px" },
                            minWidth: { xs: "auto", sm: "60px" },
                            whiteSpace: "nowrap",
                            "& .MuiButton-startIcon": {
                              marginRight: { xs: "2px", sm: "4px" },
                            },
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon fontSize="small" />}
                          onClick={() => handleDelete(transaction.id)}
                          sx={{
                            fontSize: { xs: "10px", sm: "13px" },
                            padding: { xs: "3px 6px", sm: "5px 10px" },
                            minWidth: { xs: "auto", sm: "60px" },
                            whiteSpace: "nowrap",
                            "& .MuiButton-startIcon": {
                              marginRight: { xs: "2px", sm: "4px" },
                            },
                          }}
                        >
                          Deletar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    Nenhuma transação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TransactionTable>

        {/* Cards para Mobile */}
        <MobileCardsContainer>
          {fetching ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id}>
                {/* Header do Card */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ fontWeight: 700, fontSize: "15px", mb: 0.5, color: "#1a1a1a" }}>
                      {transaction.userName}
                    </Box>
                    <Box sx={{ fontSize: "12px", color: "text.secondary" }}>
                      {transaction.userEmail}
                    </Box>
                  </Box>
                  <Chip
                    label={transaction.points.toLocaleString()}
                    color={getPointsColor(transaction.points)}
                    size="medium"
                    sx={{ fontWeight: 700, fontSize: "14px" }}
                  />
                </Box>

                {/* Tipo */}
                <Box sx={{ mb: 1.5, pb: 1.5, borderBottom: "1px solid #f0f0f0" }}>
                  <Box sx={{ fontSize: "11px", color: "text.secondary", mb: 0.5, textTransform: "uppercase", fontWeight: 600 }}>
                    Tipo de Transação
                  </Box>
                  <Box sx={{ fontSize: "13px", fontWeight: 500 }}>
                    {transaction.type_name}
                  </Box>
                </Box>

                {/* Grid de Informações */}
                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  {/* Produto */}
                  <Grid item xs={12}>
                    <Box sx={{ fontSize: "11px", color: "text.secondary", mb: 0.5, textTransform: "uppercase", fontWeight: 600 }}>
                      Produto
                    </Box>
                    <Box sx={{ fontSize: "13px", color: transaction.productID ? "text.primary" : "text.secondary" }}>
                      {transaction.productName}
                    </Box>
                  </Grid>

                  {/* Método de Pagamento */}
                  <Grid item xs={6}>
                    <Box sx={{ fontSize: "11px", color: "text.secondary", mb: 0.5, textTransform: "uppercase", fontWeight: 600 }}>
                      Pagamento
                    </Box>
                    <Chip
                      label={transaction.payment_method_name}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "11px", height: "24px" }}
                    />
                  </Grid>

                  {/* Data */}
                  <Grid item xs={6}>
                    <Box sx={{ fontSize: "11px", color: "text.secondary", mb: 0.5, textTransform: "uppercase", fontWeight: 600 }}>
                      Data
                    </Box>
                    <Box sx={{ fontSize: "13px" }}>
                      {transaction.created_at}
                    </Box>
                  </Grid>

                  {/* Responsável */}
                  <Grid item xs={12}>
                    <Box sx={{ fontSize: "11px", color: "text.secondary", mb: 0.5, textTransform: "uppercase", fontWeight: 600 }}>
                      Responsável
                    </Box>
                    <Box sx={{ fontSize: "13px" }}>
                      {transaction.responsibleName}
                    </Box>
                  </Grid>
                </Grid>

                {/* Botões de Ação */}
                <Box sx={{ display: "flex", gap: 1, pt: 1.5, borderTop: "1px solid #f0f0f0" }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon fontSize="small" />}
                    onClick={() => handleEdit(transaction)}
                    sx={{ fontSize: "12px", py: 0.8 }}
                  >
                    Editar
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon fontSize="small" />}
                    onClick={() => handleDelete(transaction.id)}
                    sx={{ fontSize: "12px", py: 0.8 }}
                  >
                    Deletar
                  </Button>
                </Box>
              </TransactionCard>
            ))
          ) : (
            <Box sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
              Nenhuma transação encontrada
            </Box>
          )}
        </MobileCardsContainer>

        {/* Paginação */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              disabled={fetching}
              size="medium"
              variant="outlined"
              sx={{
                "& .MuiPagination-ul": {
                  flexWrap: "wrap",
                  justifyContent: "center",
                },
                "& .MuiPaginationItem-root": {
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  minWidth: { xs: "24px", sm: "32px" },
                  height: { xs: "24px", sm: "32px" },
                }
              }}
            />
          </Box>
        )}
      </SimpleCard>

      {/* Dialog para Criar/Editar Transação */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            margin: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "18px", sm: "20px" } }}>
          {editingId ? "Editar Transação" : "Nova Transação"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Select
              fullWidth
              label="Usuário"
              name="userID"
              value={formData.userID}
              onChange={handleFormChange}
              displayEmpty
              required
              disabled={loadingUsers}
            >
              <MenuItem value="">
                {loadingUsers ? "Carregando usuários..." : "Selecione o Usuário"}
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} (ID: {user.id})
                </MenuItem>
              ))}
            </Select>
            <Select
              fullWidth
              name="typeID"
              value={formData.typeID}
              onChange={handleFormChange}
              displayEmpty
              required
            >
              <MenuItem value="">Selecione o Tipo</MenuItem>
              {TRANSACTION_TYPES.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            <TextField
              fullWidth
              type="number"
              label="Pontos"
              name="points"
              value={formData.points}
              onChange={handleFormChange}
              required
              helperText="Positivo para ganho, negativo para gasto"
            />
            <Select
              fullWidth
              name="payment_method_id"
              value={formData.payment_method_id}
              onChange={handleFormChange}
              displayEmpty
              required
            >
              <MenuItem value="">Selecione o Método de Pagamento</MenuItem>
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              fullWidth
              label="Produto (Opcional)"
              name="productID"
              value={formData.productID}
              onChange={handleFormChange}
              disabled={isPointsGainedType(formData.typeID) || loadingProducts}
              onOpen={() => {
                setProducts([]);
                setProductsPage(1);
              }}
              MenuProps={{
                PaperProps: {
                  onScroll: handleProductsScroll,
                  sx: {
                    maxHeight: "300px",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f1f1",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#888",
                      borderRadius: "4px",
                    },
                  },
                },
              }}
              displayEmpty
            >
              <MenuItem value="">
                {isPointsGainedType(formData.typeID)
                  ? "Desabilitado para Pontos Ganhos"
                  : loadingProducts
                    ? "Carregando produtos..."
                    : "Selecione um Produto"}
              </MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} - {product.points.toLocaleString()} pts ({product.type_name})
                </MenuItem>
              ))}
              {loadingProducts && (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Carregando mais...
                </MenuItem>
              )}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{
          p: { xs: 1.5, sm: 2 },
          gap: { xs: 1, sm: 1 },
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "12px", sm: "14px" },
              padding: { xs: "8px 12px", sm: "10px 16px" },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              width: { xs: "100%", sm: "auto" },
              fontSize: { xs: "12px", sm: "14px" },
              padding: { xs: "8px 12px", sm: "10px 16px" },
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}