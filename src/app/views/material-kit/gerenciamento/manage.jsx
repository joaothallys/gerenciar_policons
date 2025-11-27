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

// Mock data
const MOCK_USERS = [
  {
    id: 1,
    email: "joao@example.com",
    username: "joao",
    role_id: 1,
    role_name: "Usuário",
    created_at: "2025-11-10",
  },
  {
    id: 2,
    email: "maria@example.com",
    username: "maria",
    role_id: 2,
    role_name: "Gerente",
    created_at: "2025-11-08",
  },
  {
    id: 3,
    email: "pedro@example.com",
    username: "pedro",
    role_id: 1,
    role_name: "Usuário",
    created_at: "2025-11-05",
  },
  {
    id: 4,
    email: "ana@example.com",
    username: "ana",
    role_id: 1,
    role_name: "Usuário",
    created_at: "2025-11-01",
  },
];

const ROLES = [
  { id: 1, name: "Usuário" },
  { id: 2, name: "Gerente" },
];

export default function AppButton() {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState(MOCK_USERS);
  const [filteredUsers, setFilteredUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
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

  // Filtrar usuários
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

      if (dialogMode === "create") {
        // Criar novo usuário
        // await axios.post("/users", formData);
        const newUser = {
          id: Math.max(...users.map((u) => u.id), 0) + 1,
          ...formData,
          role_id: parseInt(formData.role_id),
          role_name: ROLES.find((r) => r.id == formData.role_id)?.name,
          created_at: new Date().toISOString().split("T")[0],
        };
        setUsers((prev) => [newUser, ...prev]);
        enqueueSnackbar("Usuário criado com sucesso!", { variant: "success" });
      } else if (dialogMode === "edit" && selectedUser) {
        // Editar usuário
        // await axios.put(`/users/${selectedUser.id}`, formData);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                ...u,
                email: formData.email,
                username: formData.username,
                role_id: parseInt(formData.role_id),
                role_name: ROLES.find((r) => r.id == formData.role_id)?.name,
              }
              : u
          )
        );
        enqueueSnackbar("Usuário atualizado com sucesso!", {
          variant: "success",
        });
      } else if (dialogMode === "delete" && selectedUser) {
        // Deletar usuário
        // await axios.delete(`/users/${selectedUser.id}`);
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        enqueueSnackbar("Usuário deletado com sucesso!", { variant: "success" });
      }

      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar("Erro ao processar operação", { variant: "error" });
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (userId) => {
    const newPassword = prompt("Digite a nova senha:");
    if (!newPassword) return;

    setLoading(true);
    try {
      // await axios.post(`/users/${userId}/password`, {
      //   old_password: "current_password",
      //   new_password: newPassword
      // });
      enqueueSnackbar("Senha alterada com sucesso!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Erro ao alterar senha", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleId) => {
    return roleId === 2 ? "primary" : "default";
  };

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Dashboard", path: "/dashboard/default" },
            { name: "Gerenciamento de Usuários do App" },
          ]}
        />
      </Box>

      {/* Filtros */}
      <FilterCard>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Buscar por Email ou Username"
              value={search}
              onChange={handleSearch}
              placeholder="Digite o email ou nome de usuário..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
                <TableCell align="center">ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Username</TableCell>
                <TableCell align="center">Papel</TableCell>
                <TableCell align="center">Data de Criação</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      #{user.id}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.role_name}
                        color={getRoleColor(user.role_id)}
                        size="small"
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
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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