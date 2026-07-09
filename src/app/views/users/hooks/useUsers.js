import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { userService } from "app/services/userService";
import { interpretApiError } from "app/utils/apiErrorHandler";
import { USER_ROLES } from "app/constants";

const mapUser = (u) => ({
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
  deleted_at: u.deleted_at
    ? new Date(u.deleted_at).toLocaleDateString("pt-BR")
    : null,
  isDeleted: !!u.deleted_at,
});

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [viewMode, setViewMode] = useState("active");

  const [filters, setFilters] = useState({
    search: "",
    roleFilter: "",
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [passwordFormData, setPasswordFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordFormErrors, setPasswordFormErrors] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role_id: "1",
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (searchQuery = null) => {
    try {
      setFetching(true);
      const data = await userService.getAll(searchQuery || filters.search || null);

      const usersData = Array.isArray(data) ? data : data.users || [];
      const mapped = usersData.map(mapUser);

      setUsers(mapped);
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      toast.error(message);
      console.error("Error fetching users:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users.filter((user) =>
      viewMode === "deleted" ? user.isDeleted : !user.isDeleted
    );

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
  }, [filters, users, viewMode]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewModeChange = (newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      if (!value) {
        setFormErrors((prev) => ({ ...prev, email: "" }));
      } else if (!validateEmail(value)) {
        setFormErrors((prev) => ({ ...prev, email: "Email inválido" }));
      } else {
        setFormErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (name === "username") {
      if (!value) {
        setFormErrors((prev) => ({ ...prev, username: "" }));
      } else if (value.length < 3) {
        setFormErrors((prev) => ({ ...prev, username: "Mínimo 3 caracteres" }));
      } else {
        setFormErrors((prev) => ({ ...prev, username: "" }));
      }
    }

    if (name === "password" && dialogMode === "create") {
      if (!value) {
        setFormErrors((prev) => ({ ...prev, password: "" }));
      } else if (value.length < 6) {
        setFormErrors((prev) => ({ ...prev, password: "Mínimo 6 caracteres" }));
      } else {
        setFormErrors((prev) => ({ ...prev, password: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setLoading(true);

    try {
      if (!formData.email || !formData.username) {
        toast.warning("Preencha email e username");
        setLoading(false);
        return;
      }

      if (!validateEmail(formData.email)) {
        toast.error("Email inválido. Formato: exemplo@dominio.com");
        setLoading(false);
        return;
      }

      if (formData.username.length < 3) {
        toast.error("Username deve ter mínimo 3 caracteres");
        setLoading(false);
        return;
      }

      if (dialogMode === "create" && !formData.password) {
        toast.warning("Senha é obrigatória para novo usuário");
        setLoading(false);
        return;
      }

      if (dialogMode === "create" && formData.password.length < 6) {
        toast.error("Senha deve ter mínimo 6 caracteres");
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
        toast.success("Usuário criado com sucesso!");
      } else if (dialogMode === "edit" && selectedUser) {
        await userService.update(selectedUser.id, submitData);
        toast.success("Usuário atualizado com sucesso!");
      }

      handleCloseDialog();
      await fetchUsers();
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      toast.error(message);
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    handleOpenDialog("edit", user);
  };

  const handleRequestDelete = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete(user);
    }
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setLoading(true);
      await userService.remove(userToDelete.id);
      setUserToDelete(null);
      toast.success("Usuário deletado com sucesso!");
      await fetchUsers();
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      toast.error(message);
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (userId) => {
    try {
      setLoading(true);
      await userService.restore(userId);
      toast.success("Usuário restaurado com sucesso!");
      await fetchUsers();
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      toast.error(message);
      console.error("Error restoring user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPasswordDialog = (user) => {
    setUserToChangePassword(user);
    setPasswordFormData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setPasswordFormErrors({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const handleClosePasswordDialog = () => {
    setUserToChangePassword(null);
    setPasswordFormData({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setPasswordFormErrors({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "old_password") {
      setPasswordFormErrors((prev) => ({
        ...prev,
        old_password: value ? "" : prev.old_password,
      }));
    }

    if (name === "new_password") {
      setPasswordFormErrors((prev) => ({
        ...prev,
        new_password: value && value.length < 6 ? "Mínimo 6 caracteres" : "",
        confirm_password:
          passwordFormData.confirm_password && value !== passwordFormData.confirm_password
            ? "As senhas não coincidem"
            : passwordFormData.confirm_password
            ? ""
            : prev.confirm_password,
      }));
    }

    if (name === "confirm_password") {
      setPasswordFormErrors((prev) => ({
        ...prev,
        confirm_password:
          value && value !== passwordFormData.new_password
            ? "As senhas não coincidem"
            : "",
      }));
    }
  };

  const handleChangePassword = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    const errors = {
      old_password: "",
      new_password: "",
      confirm_password: "",
    };

    if (!passwordFormData.old_password) {
      errors.old_password = "Informe a senha atual";
    }

    if (!passwordFormData.new_password) {
      errors.new_password = "Informe a nova senha";
    } else if (passwordFormData.new_password.length < 6) {
      errors.new_password = "Mínimo 6 caracteres";
    }

    if (!passwordFormData.confirm_password) {
      errors.confirm_password = "Confirme a nova senha";
    } else if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      errors.confirm_password = "As senhas não coincidem";
    }

    if (passwordFormData.old_password && passwordFormData.new_password === passwordFormData.old_password) {
      errors.new_password = "A nova senha deve ser diferente da atual";
    }

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      setPasswordFormErrors(errors);
      return;
    }

    if (!userToChangePassword) return;

    try {
      setLoading(true);
      await userService.changePassword(userToChangePassword.id, {
        old_password: passwordFormData.old_password,
        new_password: passwordFormData.new_password,
      });
      toast.success("Senha alterada com sucesso!");
      handleClosePasswordDialog();
    } catch (error) {
      const message = interpretApiError(error.message, error.response?.status, "user");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const visibleUsers = users.filter((u) =>
    viewMode === "deleted" ? u.isDeleted : !u.isDeleted
  );

  const stats = {
    total: visibleUsers.length,
    admins: visibleUsers.filter((u) => u.role_id === 2).length,
    regulars: visibleUsers.filter((u) => u.role_id === 1).length,
    totalPoints: visibleUsers.reduce((sum, u) => sum + u.points_sum, 0),
    deletedTotal: users.filter((u) => u.isDeleted).length,
    activeTotal: users.filter((u) => !u.isDeleted).length,
  };

  return {
    users: paginatedUsers,
    filteredUsers,
    filters,
    viewMode,
    page,
    totalPages,
    openDialog,
    dialogMode,
    selectedUser,
    userToDelete,
    userToChangePassword,
    passwordFormData,
    passwordFormErrors,
    formData,
    formErrors,
    stats,

    fetching,
    loading,

    handleFilterChange,
    handleViewModeChange,
    handleClearFilters,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleSubmit,
    handleEdit,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
    handleRestore,
    handleOpenPasswordDialog,
    handleClosePasswordDialog,
    handlePasswordFormChange,
    handleChangePassword,
    setPage,
  };
};
