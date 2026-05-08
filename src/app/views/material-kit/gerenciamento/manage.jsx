import React from "react";
import { IMaskInput } from "react-imask";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Pagination from "@mui/lab/Pagination";
import { useUsers } from "app/views/users/hooks/useUsers";
import { USER_ROLES } from "app/constants";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const FilterCard = styled(Card)(() => ({
  padding: "20px",
  marginBottom: "30px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
}));

const EmailMaskInput = React.forwardRef(function EmailMaskInput(props, ref) {
  return (
    <IMaskInput
      {...props}
      mask="[email]{1,100}@[domain]{1,100}.[domain]{1,10}"
      definitions={{
        email: /[a-zA-Z0-9._%-]/,
        domain: /[a-zA-Z0-9.-]/,
      }}
      inputRef={ref}
      overwrite
    />
  );
});

const UserTable = styled(TableContainer)(() => ({
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


export default function AppButton() {
  const {
    users,
    filters,
    page,
    totalPages,
    openDialog,
    dialogMode,
    selectedUser,
    formData,
    formErrors,
    loading,
    fetching,
    handleFilterChange,
    handleClearFilters,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleSubmit,
    handleDelete,
    setPage,
  } = useUsers();

  const getRoleColor = (roleId) => {
    return roleId === 2 ? "primary" : "default";
  };

  const formatPoints = (value) => {
    return Number(value || 0).toLocaleString("pt-BR");
  };

  const handleSearchSubmit = () => {
    handleFilterChange({ target: { name: "search", value: filters.search } });
  };

  const paginatedUsers = users;

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
              value={filters.search}
              onChange={(e) => handleFilterChange({ target: { name: "search", value: e.target.value } })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                }
              }}
              placeholder="Digite o nome para buscar..."
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
                },
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
                onClick={handleClearFilters}
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
              name="roleFilter"
              value={filters.roleFilter}
              onChange={(e) => handleFilterChange({ target: { name: "roleFilter", value: e.target.value } })}
              displayEmpty
            >
              <MenuItem value="">Todos os Papéis</MenuItem>
              {USER_ROLES.map((role) => (
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
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "center",
                          flexWrap: "wrap",
                          minWidth: 0,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenDialog("edit", user)}
                          sx={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            minWidth: "auto",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleOpenDialog("delete", user)}
                          sx={{
                            fontSize: "0.75rem",
                            padding: "4px 8px",
                            minWidth: "auto",
                            whiteSpace: "nowrap",
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
              onChange={(_event, value) => setPage(value)}
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
              inputComponent={EmailMaskInput}
              placeholder="exemplo@dominio.com"
              error={!!formErrors.email}
              helperText={formErrors.email}
              required
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              error={!!formErrors.username}
              helperText={formErrors.username || "Mínimo 3 caracteres"}
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
                error={!!formErrors.password}
                helperText={formErrors.password || "Mínimo 6 caracteres"}
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
              {USER_ROLES.map((role) => (
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
            onClick={() => handleSubmit()}
            variant="contained"
            color="primary"
            disabled={loading || !!formErrors.email || !!formErrors.username || (dialogMode === "create" && !!formErrors.password)}
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
            onClick={async () => {
              await handleDelete(selectedUser?.id);
              handleCloseDialog();
            }}
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