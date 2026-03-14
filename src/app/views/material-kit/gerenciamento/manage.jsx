import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Grid,
  Select,
  MenuItem,
  Chip,
  Card,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Breadcrumb, SimpleCard } from "app/components";
import { useSnackbar } from "notistack";
import { interpretApiError } from "app/utils/apiErrorHandler";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/lab/Pagination";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const FilterCard = styled(Card)(({ theme }) => ({
  padding: "20px",
  marginBottom: "30px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
}));

const UserTable = styled(TableContainer)(({ theme }) => ({
  marginBottom: "30px",
  "& .MuiTableHead-root": {
    "& .MuiTableCell-head": {
      backgroundColor: "#f5f5f5",
      fontWeight: 600,
      color: "#1a1a1a",
      borderBottom: "2px solid #e0e0e0",
    },
  },
  "& .MuiTableBody-root": {
    "& .MuiTableRow-root": {
      "&:hover": {
        backgroundColor: "#fafafa",
      },
    },
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
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
}));

const ROLES = [
  { id: 1, name: "Usuário" },
  { id: 2, name: "Admin" },
];

export default function AppButton() {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // create, edit, delete
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role_id: "1",
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Obter configuração da API
  const getApiHost = () => {
    const runtimeApiHost = window.__ENV__?.VITE_REACT_APP_API_HOST;
    return runtimeApiHost || import.meta.env.VITE_REACT_APP_API_HOST || "http://localhost:5000";
  };

  const getAuthToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      enqueueSnackbar("Token não encontrado. Faça login novamente.", { variant: "warning" });
      return null;
    }
    return token;
  };

  // Buscar usuários da API
  const fetchUsers = async (searchQuery = null) => {
    const token = getAuthToken();
    if (!token) return;

    const apiHost = getApiHost();
    let url = `${apiHost}/users`;

    // Usar searchQuery se fornecido, senão usar o estado search
    const queryToUse = searchQuery !== null ? searchQuery : search;

    // Adicionar busca por nome se existir
    if (queryToUse && queryToUse.trim()) {
      url += `?name=${encodeURIComponent(queryToUse.trim())}`;
    }

    try {
      setFetching(true);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: token, // A API espera o token direto, sem "Bearer"
        },
      });

      if (!res.ok) {
        enqueueSnackbar(`Erro ao buscar usuários: ${res.status}`, { variant: "error" });
        setFetching(false);
        return;
      }

      const json = await res.json();
      const usersData = Array.isArray(json) ? json : [];

      const mapped = usersData
        .filter((u) => !u.deleted_at) // Filtrar usuários com deleted_at não nulo
        .map((u) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          role_id: u.role_id,
          role_name: ROLES.find((r) => r.id === u.role_id)?.name || "Desconhecido",
          points_eligible: Number(u.points_eligible || 0),
          points_sum: Number(u.points_sum || 0),
          created_at: u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "-",
        }));

      setUsers(mapped);
      enqueueSnackbar(`${mapped.length} usuário(s) carregado(s)`, { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Erro ao buscar usuários", { variant: "error" });
      console.error("Erro:", error);
    } finally {
      setFetching(false);
    }
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuários localmente (para roleFilter)
  useEffect(() => {
    let result = users;

    if (search) {
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter) {
      result = result.filter((user) => user.role_id == roleFilter);
    }

    setFilteredUsers(result);
    setPage(1);
  }, [search, roleFilter, users]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearch("");
    setRoleFilter("");
    // Buscar sem filtro
    fetchUsers("");
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);

    if (mode === "create") {
      setFormData({
        email: "",
        username: "",
        password: "",
        role_id: "1",
      });
    } else if (mode === "edit" && user) {
      setFormData({
        email: user.email,
        username: user.username,
        password: "",
        role_id: user.role_id.toString(),
      });
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);

    try {
      // Validações
      if (!formData.email || !formData.username) {
        enqueueSnackbar("Preencha email e username", { variant: "warning" });
        setLoading(false);
        return;
      }

      if (dialogMode === "create" && !formData.password) {
        enqueueSnackbar("Senha é obrigatória para novo usuário", {
          variant: "warning",
        });
        setLoading(false);
        return;
      }

      const apiHost = getApiHost();

      if (dialogMode === "create") {
        // Criar novo usuário
        const res = await fetch(`${apiHost}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
            role_id: parseInt(formData.role_id),
          }),
        });

        if (!res.ok) {
          let errorMessage = "";
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || "";
          } catch (e) {
            errorMessage = await res.text();
          }

          const friendlyMessage = interpretApiError(errorMessage, res.status, "user");
          enqueueSnackbar(friendlyMessage, { variant: "error" });
          console.error(`Erro ao criar usuário (${res.status}):`, errorMessage);
          setLoading(false);
          return;
        }

        enqueueSnackbar("Usuário criado com sucesso!", { variant: "success" });
        await fetchUsers();
      } else if (dialogMode === "edit" && selectedUser) {
        // Editar usuário
        const payload = {
          email: formData.email,
          username: formData.username,
          role_id: parseInt(formData.role_id),
        };

        // Adicionar senha apenas se foi preenchida
        if (formData.password) {
          payload.password = formData.password;
        }

        const res = await fetch(`${apiHost}/users/${selectedUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let errorMessage = "";
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || "";
          } catch (e) {
            errorMessage = await res.text();
          }

          const friendlyMessage = interpretApiError(errorMessage, res.status, "user");
          enqueueSnackbar(friendlyMessage, { variant: "error" });
          console.error(`Erro ao atualizar usuário (${res.status}):`, errorMessage);
          setLoading(false);
          return;
        }

        enqueueSnackbar("Usuário atualizado com sucesso!", {
          variant: "success",
        });
        await fetchUsers();
      } else if (dialogMode === "delete" && selectedUser) {
        // Deletar usuário
        const res = await fetch(`${apiHost}/users/${selectedUser.id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        });

        if (!res.ok) {
          let errorMessage = "";
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorData.error || "";
          } catch (e) {
            errorMessage = await res.text();
          }

          const friendlyMessage = interpretApiError(errorMessage, res.status, "delete");
          enqueueSnackbar(friendlyMessage, { variant: "error" });
          console.error(`Erro ao deletar usuário (${res.status}):`, errorMessage);
          setLoading(false);
          return;
        }

        enqueueSnackbar("Usuário deletado com sucesso!", { variant: "success" });
        await fetchUsers();
      }

      handleCloseDialog();
    } catch (error) {
      // Capturar erros não tratados
      const errorMessage = error.message || "Erro inesperado ao processar operação";
      enqueueSnackbar(errorMessage, { variant: "error" });
      console.error("Erro não tratado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (userId) => {
    const newPassword = prompt("Digite a nova senha:");
    if (!newPassword) return;

    const token = getAuthToken();
    if (!token) return;

    const apiHost = getApiHost();
    setLoading(true);
    try {
      const res = await fetch(`${apiHost}/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        let errorMessage = "";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || "";
        } catch (e) {
          errorMessage = await res.text();
        }

        const friendlyMessage = interpretApiError(errorMessage, res.status, "user");
        enqueueSnackbar(friendlyMessage, { variant: "error" });
        console.error(`Erro ao alterar senha (${res.status}):`, errorMessage);
        setLoading(false);
        return;
      }

      enqueueSnackbar("Senha alterada com sucesso!", { variant: "success" });
    } catch (error) {
      const errorMessage = error.message || "Erro inesperado ao alterar senha";
      enqueueSnackbar(errorMessage, { variant: "error" });
      console.error("Erro não tratado:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleId) => {
    return roleId === 2 ? "primary" : "default";
  };

  const formatPoints = (value) => {
    return Number(value || 0).toLocaleString("pt-BR");
  };

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Transações", path: "/material/customer" },
            { name: "Gerenciamento de Usuários do App" },
          ]}
        />
      </Box>

      {/* Filtros */}
      <FilterCard>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              size="small"
              label="Buscar por Nome (pressione Enter)"
              value={search}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
              placeholder="Digite o nome para buscar..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSearchSubmit}
                disabled={fetching}
              >
                Buscar
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearSearch}
                disabled={fetching}
              >
                Limpar
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Select
              fullWidth
              size="small"
              value={roleFilter}
              onChange={handleRoleFilter}
              displayEmpty
            >
              <MenuItem value="">Todos os Papéis</MenuItem>
              {ROLES.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </FilterCard>

      {/* Botão Criar Usuário */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("create")}
        >
          Novo Usuário
        </Button>
      </Box>

      {/* Tabela de Usuários */}
      <SimpleCard title="Lista de Usuários">
        <UserTable>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Email</TableCell>
                <TableCell>Nome de Usuário</TableCell>
                <TableCell align="center">Papel</TableCell>
                <TableCell align="center">Pontos Elegíveis</TableCell>
                <TableCell align="center">Soma de Pontos</TableCell>
                <TableCell align="center">Data de Criação</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fetching ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell sx={{ pl: 3 }}>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.role_name}
                        color={getRoleColor(user.role_id)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatPoints(user.points_eligible)}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatPoints(user.points_sum)}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">{user.created_at}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenDialog("edit", user)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleOpenDialog("delete", user)}
                        >
                          Deletar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </UserTable>

        {/* Paginação */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </SimpleCard>

      {/* Dialog para Criar/Editar */}
      <Dialog
        open={openDialog && (dialogMode === "create" || dialogMode === "edit")}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "Novo Usuário" : "Editar Usuário"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              required
            />
            {dialogMode === "create" && (
              <TextField
                fullWidth
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                required
              />
            )}
            {dialogMode === "edit" && (
              <TextField
                fullWidth
                label="Senha (deixe em branco para não alterar)"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
              />
            )}
            <Select
              fullWidth
              name="role_id"
              value={formData.role_id}
              onChange={handleFormChange}
            >
              {ROLES.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Deletar */}
      <Dialog
        open={openDialog && dialogMode === "delete"}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box>
            Tem certeza que deseja deletar o usuário{" "}
            <strong>{selectedUser?.username}</strong>? Esta ação não pode ser
            desfeita.
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Deletar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}