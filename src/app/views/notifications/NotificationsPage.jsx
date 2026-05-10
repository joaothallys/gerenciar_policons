import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Breadcrumb, SimpleCard } from "app/components";
import { notificationService } from "app/services/notificationService";
import { interpretApiError } from "app/utils/apiErrorHandler";
import SendIcon from "@mui/icons-material/Send";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import StorageIcon from "@mui/icons-material/Storage";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import AppleIcon from "@mui/icons-material/Apple";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: "24px",
  textAlign: "center",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  "& .stat-value": {
    fontSize: "32px",
    fontWeight: 700,
    marginTop: "10px",
  },
  "& .stat-label": {
    fontSize: "13px",
    fontWeight: 500,
    opacity: 0.9,
    marginTop: "8px",
  },
}));

const UserCard = styled(Card)(({ theme }) => ({
  padding: "20px",
  marginBottom: "16px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
  border: "1px solid #e0e0e0",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  },
}));

export default function NotificationsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    selectedUser: "",
    route: "",
  });

  const fetchUsersWithTokens = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAllUsersWithTokens();
      setUsers(data.users);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Erro ao buscar usuários";
      const statusCode = error.response?.status || 500;
      const message = interpretApiError(errorMessage, statusCode, "notification");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithTokens();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendBroadcast = async () => {
    if (!formData.title || !formData.message) {
      toast.warning("Preencha título e mensagem");
      return;
    }

    setSending(true);
    try {
      await notificationService.sendBroadcast(
        formData.title,
        formData.message,
        formData.route ? { route: formData.route } : {}
      );
      toast.success("Notificação enviada para todos os usuários!");
      setFormData({ title: "", message: "", selectedUser: "", route: "" });
      setOpenDialog(false);
      await fetchUsersWithTokens();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Erro ao enviar notificação";
      const statusCode = error.response?.status || 500;
      const message = interpretApiError(errorMessage, statusCode, "notification");
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleSendToUser = async (userId) => {
    if (!formData.title || !formData.message) {
      toast.warning("Preencha título e mensagem");
      return;
    }

    setSending(true);
    try {
      await notificationService.sendToUser(
        userId,
        formData.title,
        formData.message,
        formData.route ? { route: formData.route } : {}
      );
      toast.success(`Notificação enviada para o usuário!`);
      setFormData({ title: "", message: "", selectedUser: "", route: "" });
      setOpenDialog(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Erro ao enviar notificação";
      const statusCode = error.response?.status || 500;
      const message = interpretApiError(errorMessage, statusCode, "notification");
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleOpenDialog = (mode) => {
    setTabValue(mode === "broadcast" ? 0 : 1);
    setFormData({ title: "", message: "", selectedUser: "", route: "" });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const totalUsers = users.length;
  const totalTokens = users.reduce((sum, user) => sum + user.activeTokens, 0);
  const androidUsers = users.filter((u) => u.tokens.some((t) => t.platform === "android")).length;
  const iosUsers = users.filter((u) => u.tokens.some((t) => t.platform === "ios")).length;

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Ferramentas", path: "/transactions" },
            { name: "Notificações" },
          ]}
        />
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Centro de Notificações
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gerencie e envie notificações para seus usuários
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GroupsIcon />}
            onClick={() => handleOpenDialog("broadcast")}
          >
            Notificação em Massa
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SendIcon />}
            onClick={() => handleOpenDialog("user")}
          >
            Notificação Individual
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={0}>
            <GroupsIcon sx={{ fontSize: 28 }} />
            <div className="stat-value">{totalUsers}</div>
            <div className="stat-label">Usuários com Tokens</div>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={0} sx={{ background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" }}>
            <StorageIcon sx={{ fontSize: 28 }} />
            <div className="stat-value">{totalTokens}</div>
            <div className="stat-label">Tokens Ativos</div>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={0} sx={{ background: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)" }}>
            <PhoneAndroidIcon sx={{ fontSize: 28 }} />
            <div className="stat-value">{androidUsers}</div>
            <div className="stat-label">Dispositivos Android</div>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={0} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <AppleIcon sx={{ fontSize: 28 }} />
            <div className="stat-value">{iosUsers}</div>
            <div className="stat-label">Dispositivos iOS</div>
          </StatCard>
        </Grid>
      </Grid>

      {/* Notification Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NotificationsIcon color="primary" />
            {tabValue === 0 ? "Notificação em Massa" : "Notificação Individual"}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Ex: 🔔 Nova atualização disponível"
            />
            <TextField
              fullWidth
              label="Mensagem"
              name="message"
              value={formData.message}
              onChange={handleFormChange}
              multiline
              rows={4}
              placeholder="Digite a mensagem da notificação..."
            />
            <TextField
              fullWidth
              label="Rota (Opcional)"
              name="route"
              value={formData.route}
              onChange={handleFormChange}
              placeholder="Ex: /(tabs)/index"
              helperText="Define para onde o usuário será redirecionado ao clicar"
            />

            {tabValue === 1 && (
              <FormControl fullWidth>
                <InputLabel>Selecionar Usuário</InputLabel>
                <Select
                  name="selectedUser"
                  value={formData.selectedUser}
                  onChange={handleFormChange}
                  label="Selecionar Usuário"
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username} {user.email && `(${user.email})`} - {user.activeTokens} token(s)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={
              tabValue === 0
                ? handleSendBroadcast
                : () => handleSendToUser(formData.selectedUser)
            }
            variant="contained"
            color="primary"
            disabled={
              sending ||
              !formData.title ||
              !formData.message ||
              (tabValue === 1 && !formData.selectedUser)
            }
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sending ? "Enviando..." : "Enviar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Users List */}
      <SimpleCard title={`Usuários com Tokens Ativos (${users.length})`}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Alert severity="info">Nenhum usuário com tokens ativos no momento</Alert>
        ) : (
          <Box>
            {users.map((user) => (
              <UserCard key={user._id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {user.username}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.email || user.username}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Tokens
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                        <Chip
                          label={`${user.activeTokens} Ativo${user.activeTokens !== 1 ? "s" : ""}`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                        {user.inactiveTokens > 0 && (
                          <Chip
                            label={`${user.inactiveTokens} Inativo${user.inactiveTokens !== 1 ? "s" : ""}`}
                            color="default"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}>
                        {user.tokens.map((token, idx) => (
                          <Chip
                            key={idx}
                            icon={token.platform === "android" ? <PhoneAndroidIcon /> : <AppleIcon />}
                            label={token.platform}
                            size="small"
                            color={token.active ? "primary" : "default"}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: { xs: "left", sm: "right" } }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => {
                        setFormData({
                          title: "",
                          message: "",
                          selectedUser: user._id,
                          route: "",
                        });
                        setTabValue(1);
                        setOpenDialog(true);
                      }}
                    >
                      Enviar Notificação
                    </Button>
                  </Grid>
                </Grid>
              </UserCard>
            ))}
          </Box>
        )}
      </SimpleCard>
    </Container>
  );
}
