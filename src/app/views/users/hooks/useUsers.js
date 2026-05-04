import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { userService } from "app/services/userService";
import { interpretApiError } from "app/utils/apiErrorHandler";
import { USER_ROLES } from "app/constants";

export const useUsers = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Main data states
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    roleFilter: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // create, edit, delete
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role_id: "1",
  });

  // Loading states
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async (searchQuery = null) => {
    try {
      setFetching(true);
      const data = await userService.getAll(searchQuery || filters.search || null);

      // Map and filter soft-deleted users
      const usersData = Array.isArray(data) ? data : data.users || [];
      const mapped = usersData
        .filter((u) => !u.deleted_at) // Filter soft-deleted users
        .map((u) => ({
          id: u.id,
          email: u.email,
          username: u.username,
          role_id: u.role_id,
          role_name:
            USER_ROLES.find((r) => r.id === u.role_id)?.name || "Desconhecido",
          points_eligible: Number(u.points_eligible || 0),
          points_sum: Number(u.points_sum || 0),
          created_at: u.created_at
            ? new Date(u.created_at).toLocaleDateString("pt-BR")
            : "-",
        }));

      setUsers(mapped);
      enqueueSnackbar(`${mapped.length} usuário(s) carregado(s)`, {
        variant: "success",
      });
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      enqueueSnackbar(message, { variant: "error" });
      console.error("Error fetching users:", error);
    } finally {
      setFetching(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users locally
  useEffect(() => {
    let result = users;

    if (filters.search) {
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.username.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.roleFilter) {
      result = result.filter((user) => user.role_id === Number(filters.roleFilter));
    }

    setFilteredUsers(result);
    setPage(1);
  }, [filters, users]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", roleFilter: "" });
    fetchUsers("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
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

      const submitData = {
        email: formData.email,
        username: formData.username,
        role_id: parseInt(formData.role_id),
      };

      if (formData.password) {
        submitData.password = formData.password;
      }

      if (dialogMode === "create") {
        await userService.create(submitData);
        enqueueSnackbar("Usuário criado com sucesso!", { variant: "success" });
      } else if (dialogMode === "edit" && selectedUser) {
        await userService.update(selectedUser.id, submitData);
        enqueueSnackbar("Usuário atualizado com sucesso!", {
          variant: "success",
        });
      }

      handleCloseDialog();
      await fetchUsers();
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      enqueueSnackbar(message, { variant: "error" });
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    handleOpenDialog("edit", user);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Deseja deletar este usuário?")) return;

    try {
      setLoading(true);
      await userService.remove(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      enqueueSnackbar("Usuário deletado com sucesso!", { variant: "success" });
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      enqueueSnackbar(message, { variant: "error" });
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (userId) => {
    const newPassword = window.prompt("Digite a nova senha:");
    if (!newPassword) return;

    try {
      setLoading(true);
      await userService.changePassword(userId, newPassword);
      enqueueSnackbar("Senha alterada com sucesso!", { variant: "success" });
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role_id === 2).length,
    regulars: users.filter((u) => u.role_id === 1).length,
    totalPoints: users.reduce((sum, u) => sum + u.points_sum, 0),
  };

  return {
    // Data
    users: paginatedUsers,
    filteredUsers,
    filters,
    page,
    totalPages,
    openDialog,
    dialogMode,
    selectedUser,
    formData,
    stats,

    // Loading states
    fetching,
    loading,

    // Handlers
    handleFilterChange,
    handleClearFilters,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleChangePassword,
    setPage,
  };
};
