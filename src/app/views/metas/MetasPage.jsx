import { Box, Button, Card, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, CircularProgress, LinearProgress, Typography } from "@mui/material";
import { Breadcrumb, SimpleCard } from "app/components";
import { styled } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { metaService } from "app/services/metaService";
import { interpretApiError } from "app/utils/apiErrorHandler";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const MetaCard = styled(Card)(({ theme }) => ({
  padding: "20px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
  marginBottom: "16px",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
}));

export default function MetasPage() {
  const [metas, setMetas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [formData, setFormData] = useState({
    month_ref: new Date().toISOString().slice(0, 7),
    meta_perc: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [viewMode, setViewMode] = useState("cards");
  const [page, setPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState("");
  const [filteredMeta, setFilteredMeta] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch metas
  const fetchMetas = async () => {
    try {
      setFetching(true);
      const response = await metaService.getAllPages();
      const mappedMetas = response.items.map((meta) => ({
        id: meta.id,
        month_ref: meta.month_ref,
        meta_perc: meta.meta_perc,
        responsible_user_id: meta.responsible_user_id,
        updated_at: meta.updated_at,
      }));
      setMetas(mappedMetas);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Erro ao buscar metas";
      const statusCode = error.response?.status || 500;
      const message = interpretApiError(errorMessage, statusCode, "meta");
      toast.error(message);
    } finally {
      setFetching(false);
    }
  };

  const fetchMetaByMonth = async (monthRef) => {
    if (!monthRef) {
      setFilteredMeta(null);
      return;
    }

    setFilterLoading(true);
    try {
      const meta = await metaService.getByMonth(monthRef);
      setFilteredMeta({
        id: meta.id,
        month_ref: meta.month_ref,
        meta_perc: meta.meta_perc,
        responsible_user_id: meta.responsible_user_id,
        updated_at: meta.updated_at,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Meta não encontrada";
      const statusCode = error.response?.status || 500;
      const message = interpretApiError(errorMessage, statusCode, "meta");
      toast.error(message);
      setFilteredMeta(null);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleFilterMonthChange = (e) => {
    const month = e.target.value;
    setFilterMonth(month);
    if (month) {
      fetchMetaByMonth(month);
    } else {
      setFilteredMeta(null);
    }
  };

  useEffect(() => {
    fetchMetas();
  }, []);

  // Pagination
  const totalPages = Math.ceil(metas.length / itemsPerPage);
  const paginatedMetas = metas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Handlers
  const handleOpenDialog = (mode, meta = null) => {
    setDialogMode(mode);
    setSelectedMeta(meta);
    if (mode === "create") {
      setFormData({
        month_ref: new Date().toISOString().slice(0, 7),
        meta_perc: "",
      });
    } else if (mode === "edit" && meta) {
      setFormData({
        month_ref: meta.month_ref?.slice(0, 7),
        meta_perc: meta.meta_perc?.toString(),
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
      if (!formData.month_ref || !formData.meta_perc) {
        toast.warning("Preencha todos os campos");
        setLoading(false);
        return;
      }

      const meta_perc = parseInt(formData.meta_perc);
      if (meta_perc < 0 || meta_perc > 1000) {
        toast.warning("Meta deve estar entre 0 e 1000");
        setLoading(false);
        return;
      }

      const monthRef = `${formData.month_ref}-01`;

      if (dialogMode === "create") {
        await metaService.create(monthRef, meta_perc);
        toast.success("Meta criada com sucesso!");
      } else if (dialogMode === "edit" && selectedMeta) {
        await metaService.update(selectedMeta.id, monthRef, meta_perc);
        toast.success("Meta atualizada com sucesso!");
      }

      handleCloseDialog();
      await fetchMetas();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Erro ao processar operacao";
      const statusCode = error.response?.status || 500;
      const message = interpretApiError(errorMessage, statusCode, "meta");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (metaId) => {
    if (!window.confirm("Deseja deletar esta meta?")) return;

    try {
      setLoading(true);
      await metaService.remove(metaId);
      setMetas((prev) => prev.filter((m) => m.id !== metaId));
      toast.success("Meta deletada com sucesso!");
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Erro ao deletar meta";
      const statusCode = error.response?.status || 500;
      const message = interpretApiError(errorMessage, statusCode, "meta");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Metas Mensais", path: "/metas" },
            { name: "Metas" },
          ]}
        />
      </Box>

      {/* Filter Card */}
      <Card elevation={0} sx={{ p: 3, mb: 3, border: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <TextField
              fullWidth
              size="small"
              label="Filtrar por Mês"
              name="filterMonth"
              type="month"
              value={filterMonth}
              onChange={handleFilterMonthChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
      </Card>

      {/* Filtered Meta Display */}
      {filterMonth && (
        <Card elevation={0} sx={{ mb: 3, border: "2px solid #667eea", p: 3 }}>
          {filterLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={32} />
            </Box>
          ) : filteredMeta ? (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: "textSecondary", mb: 0.5 }}>
                  MÊS SELECIONADO
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {filteredMeta.month_ref?.slice(0, 7)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                  <Typography variant="subtitle2" sx={{ color: "textSecondary", mb: 0.5 }}>
                    META PERCENTUAL
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color:
                        filteredMeta.meta_perc >= 100
                          ? "#4caf50"
                          : filteredMeta.meta_perc >= 75
                          ? "#ff9800"
                          : "#f44336",
                      mb: 1,
                    }}
                  >
                    {filteredMeta.meta_perc}%
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog("edit", filteredMeta)}
                    >
                      Editar
                    </Button>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ backgroundColor: "#f5f5f5", p: 1.5, borderRadius: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(filteredMeta.meta_perc, 100)}
                    sx={{
                      height: "8px",
                      borderRadius: 1,
                      backgroundColor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          filteredMeta.meta_perc >= 100
                            ? "#4caf50"
                            : filteredMeta.meta_perc >= 75
                            ? "#ff9800"
                            : "#f44336",
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", py: 2 }}>
              Nenhuma meta encontrada para este mês
            </Typography>
          )}
        </Card>
      )}

      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Metas Mensais ({metas.length})
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("create")}
        >
          Nova Meta
        </Button>
      </Box>

      {fetching && metas.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : paginatedMetas.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
          Nenhuma meta encontrada
        </Box>
      ) : (
        <>
          {/* Cards View */}
          <Box sx={{ mb: 3 }}>
            {paginatedMetas.map((meta) => {
              const monthDate = new Date(meta.month_ref);
              const monthName = monthDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });
              const progress = Math.min((meta.meta_perc / 1000) * 100, 100);

              return (
                <MetaCard key={meta.id}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: "16px", fontWeight: 600, textTransform: "capitalize" }}>
                        {monthName}
                      </Typography>
                      <Typography sx={{ fontSize: "14px", color: "text.secondary" }}>
                        Meta: {meta.meta_perc}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => handleOpenDialog("edit", meta)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => handleDelete(meta.id)}
                      >
                        Deletar
                      </Button>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: "8px", borderRadius: "4px" }}
                  />
                </MetaCard>
              );
            })}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === "create" ? "Nova Meta" : "Editar Meta"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              type="month"
              label="Mês"
              name="month_ref"
              value={formData.month_ref}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="number"
              label="Meta (%)"
              name="meta_perc"
              value={formData.meta_perc}
              onChange={handleFormChange}
              inputProps={{ min: "0", max: "1000" }}
              helperText="Entre 0 e 1000"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
