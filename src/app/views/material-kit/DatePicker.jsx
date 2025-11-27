import React, { useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Chip,
  Paper,
  Alert,
  AlertTitle,
  LinearProgress,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Breadcrumb, SimpleCard } from "app/components";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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

const MetaTable = styled(TableContainer)(({ theme }) => ({
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

const MetaCard = styled(Card)(({ theme }) => ({
  padding: "20px",
  marginBottom: "20px",
  borderLeft: "4px solid #667eea",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateX(4px)",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
  },
}));

// Mock data - Metas mensais
const MOCK_METAS = [
  {
    id: 1,
    month_ref: "2025-11",
    meta_perc: 100,
    responsible_user_id: 1,
    user: { id: 1, username: "João Silva", email: "joao@example.com" },
    updated_at: "2025-11-15",
    progress: 75,
  },
  {
    id: 2,
    month_ref: "2025-10",
    meta_perc: 120,
    responsible_user_id: 2,
    user: { id: 2, username: "Maria Santos", email: "maria@example.com" },
    updated_at: "2025-10-30",
    progress: 100,
  },
  {
    id: 3,
    month_ref: "2025-09",
    meta_perc: 90,
    responsible_user_id: 1,
    user: { id: 1, username: "João Silva", email: "joao@example.com" },
    updated_at: "2025-09-28",
    progress: 85,
  },
  {
    id: 4,
    month_ref: "2025-12",
    meta_perc: 150,
    responsible_user_id: 3,
    user: { id: 3, username: "Pedro Costa", email: "pedro@example.com" },
    updated_at: "2025-11-20",
    progress: 45,
  },
];

export default function MonthlyMetasPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [metas, setMetas] = useState(MOCK_METAS);
  const [filteredMetas, setFilteredMetas] = useState(MOCK_METAS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [viewMode, setViewMode] = useState("card"); // card ou table

  const [formData, setFormData] = useState({
    month_ref: "",
    meta_perc: "",
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredMetas.length / itemsPerPage);
  const paginatedMetas = filteredMetas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Filtrar metas
  React.useEffect(() => {
    let result = metas;

    if (search) {
      result = result.filter(
        (meta) =>
          meta.month_ref.includes(search) ||
          meta.user.username.toLowerCase().includes(search.toLowerCase()) ||
          meta.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredMetas(result);
    setPage(1);
  }, [search, metas]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleOpenDialog = (mode, meta = null) => {
    setDialogMode(mode);
    setSelectedMeta(meta);

    if (mode === "create") {
      setFormData({
        month_ref: new Date().toISOString().split("T")[0].slice(0, 7), // YYYY-MM
        meta_perc: "",
      });
    } else if (mode === "edit" && meta) {
      setFormData({
        month_ref: meta.month_ref,
        meta_perc: meta.meta_perc.toString(),
      });
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMeta(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Validações
      if (!formData.month_ref || !formData.meta_perc) {
        enqueueSnackbar("Preencha todos os campos obrigatórios", {
          variant: "warning",
        });
        setLoading(false);
        return;
      }

      const metaValue = parseInt(formData.meta_perc);
      if (isNaN(metaValue) || metaValue < 0 || metaValue > 1000) {
        enqueueSnackbar("Meta deve ser um número entre 0 e 1000", {
          variant: "warning",
        });
        setLoading(false);
        return;
      }

      if (dialogMode === "create") {
        // const formDataToSend = new FormData();
        // formDataToSend.append("meta_perc", formData.meta_perc);
        // formDataToSend.append("month_ref", formData.month_ref);
        // await axios.post("/meta", formDataToSend);

        const newMeta = {
          id: Math.max(...metas.map((m) => m.id), 0) + 1,
          ...formData,
          meta_perc: metaValue,
          responsible_user_id: 1, // Seria do usuário logado
          user: { id: 1, username: "Usuário Atual", email: "user@example.com" },
          updated_at: new Date().toISOString().split("T")[0],
          progress: Math.floor(Math.random() * 100),
        };
        setMetas((prev) => [newMeta, ...prev]);
        enqueueSnackbar("Meta criada com sucesso!", { variant: "success" });
      } else if (dialogMode === "edit" && selectedMeta) {
        // const formDataToSend = new FormData();
        // formDataToSend.append("meta_perc", formData.meta_perc);
        // formDataToSend.append("month_ref", formData.month_ref);
        // await axios.put(`/meta/${selectedMeta.id}`, formDataToSend);

        setMetas((prev) =>
          prev.map((m) =>
            m.id === selectedMeta.id
              ? {
                ...m,
                meta_perc: metaValue,
                month_ref: formData.month_ref,
                updated_at: new Date().toISOString().split("T")[0],
              }
              : m
          )
        );
        enqueueSnackbar("Meta atualizada com sucesso!", {
          variant: "success",
        });
      } else if (dialogMode === "delete" && selectedMeta) {
        // await axios.delete(`/meta/${selectedMeta.id}`);
        setMetas((prev) => prev.filter((m) => m.id !== selectedMeta.id));
        enqueueSnackbar("Meta deletada com sucesso!", { variant: "success" });
      }

      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar("Erro ao processar operação", { variant: "error" });
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "success";
    if (progress >= 75) return "info";
    if (progress >= 50) return "warning";
    return "error";
  };

  const getMetaStatusColor = (meta_perc) => {
    if (meta_perc >= 150) return "error";
    if (meta_perc >= 120) return "warning";
    return "success";
  };

  const totalMetas = metas.length;
  const avgMeta = (
    metas.reduce((sum, m) => sum + m.meta_perc, 0) / metas.length
  ).toFixed(0);
  const completedMetas = metas.filter((m) => m.progress >= 100).length;

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Dashboard", path: "/dashboard/default" },
            { name: "Metas Mensais" },
          ]}
        />
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={0}>
            <div className="stat-label">TOTAL DE METAS</div>
            <div className="stat-value">{totalMetas}</div>
            <div className="stat-label">Cadastradas no período</div>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            }}
          >
            <div className="stat-label">METAS ATINGIDAS</div>
            <div className="stat-value">{completedMetas}</div>
            <div className="stat-label">100% ou mais</div>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            }}
          >
            <div className="stat-label">META MÉDIA</div>
            <div className="stat-value">{avgMeta}%</div>
            <div className="stat-label">Percentual médio</div>
          </StatCard>
        </Grid>
      </Grid>

      {/* Filtros */}
      <FilterCard>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Buscar por Mês ou Responsável"
              value={search}
              onChange={handleSearch}
              placeholder="YYYY-MM ou nome..."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("create")}
            >
              Nova Meta
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={viewMode === "card" ? "contained" : "outlined"}
            onClick={() => setViewMode("card")}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "contained" : "outlined"}
            onClick={() => setViewMode("table")}
          >
            Tabela
          </Button>
        </Box>
      </FilterCard>

      {/* Visualização em Cards */}
      {viewMode === "card" && (
        <Box>
          {paginatedMetas.length > 0 ? (
            paginatedMetas.map((meta) => (
              <MetaCard key={meta.id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {meta.month_ref}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Responsável: {meta.user.username}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {meta.user.email}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Chip
                        label={`Meta: ${meta.meta_perc}%`}
                        color={getMetaStatusColor(meta.meta_perc)}
                        size="small"
                        icon={<TrendingUpIcon />}
                      />
                      <Chip
                        label={`Atualizado: ${meta.updated_at}`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Progresso
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {meta.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={meta.progress}
                        color={getProgressColor(meta.progress)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog("edit", meta)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleOpenDialog("delete", meta)}
                      >
                        Deletar
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </MetaCard>
            ))
          ) : (
            <Alert severity="info">
              <AlertTitle>Nenhuma meta encontrada</AlertTitle>
              Crie uma nova meta para começar a acompanhar seu progresso
            </Alert>
          )}

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
        </Box>
      )}

      {/* Visualização em Tabela */}
      {viewMode === "table" && (
        <SimpleCard title="Metas Mensais">
          <MetaTable>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Mês</TableCell>
                  <TableCell>Responsável</TableCell>
                  <TableCell align="right">Meta (%)</TableCell>
                  <TableCell align="center">Progresso</TableCell>
                  <TableCell align="center">Última Atualização</TableCell>
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
                ) : paginatedMetas.length > 0 ? (
                  paginatedMetas.map((meta) => (
                    <TableRow key={meta.id}>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {meta.month_ref}
                      </TableCell>
                      <TableCell>{meta.user.username}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${meta.meta_perc}%`}
                          color={getMetaStatusColor(meta.meta_perc)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ minWidth: 150 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {meta.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={meta.progress}
                            color={getProgressColor(meta.progress)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">{meta.updated_at}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenDialog("edit", meta)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleOpenDialog("delete", meta)}
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
                      Nenhuma meta encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </MetaTable>

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
      )}

      {/* Dialog para Criar/Editar */}
      <Dialog
        open={openDialog && (dialogMode === "create" || dialogMode === "edit")}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "Nova Meta Mensal" : "Editar Meta"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Mês de Referência"
              name="month_ref"
              type="month"
              value={formData.month_ref}
              onChange={handleFormChange}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Meta Percentual (0-1000%)"
              name="meta_perc"
              type="number"
              value={formData.meta_perc}
              onChange={handleFormChange}
              required
              inputProps={{ min: "0", max: "1000", step: "10" }}
              helperText="Digite o percentual da meta (ex: 100, 120, 150)"
            />
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
          <Alert severity="warning">
            <AlertTitle>Atenção</AlertTitle>
            Tem certeza que deseja deletar a meta de{" "}
            <strong>{selectedMeta?.month_ref}</strong>? Esta ação não pode ser
            desfeita.
          </Alert>
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
