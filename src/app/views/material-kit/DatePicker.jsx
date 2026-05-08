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
import { metaService } from "app/services/metaService";
import { interpretApiError } from "app/utils/apiErrorHandler";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
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

export default function MonthlyMetasPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [metas, setMetas] = useState([]);
    const [filteredMetas, setFilteredMetas] = useState([]);
    const [summary, setSummary] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMetas, setLoadingMetas] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState("create");
    const [selectedMeta, setSelectedMeta] = useState(null);
    const [viewMode, setViewMode] = useState("card");

    const [formData, setFormData] = useState({
        month_ref: "",
        meta_perc: "",
    });

    const mapMetaFromApi = (meta) => {
        const monthRef = meta?.month_ref ? String(meta.month_ref).slice(0, 7) : "-";
        const updatedAt = meta?.updated_at ? String(meta.updated_at).slice(0, 10) : "-";
        const metaPerc = Number(meta?.meta_perc ?? 0);

        return {
            id: meta?.id,
            month_ref: monthRef,
            meta_perc: metaPerc,
            responsible_user_id: meta?.responsible_user_id,
            user: {
                id: meta?.responsible_user_id,
                username: `Responsavel ${meta?.responsible_user_id ?? "-"}`,
                email: "-",
            },
            updated_at: updatedAt,
            progress: Math.min(Math.max(metaPerc, 0), 100),
        };
    };

    const fetchMetas = async () => {
        setLoadingMetas(true);

        try {
            const response = await metaService.getAllPages();
            const allItems = response.items.map(mapMetaFromApi);
            setMetas(allItems);
            setSummary(response.summary ?? null);
        } catch (error) {
            const message = interpretApiError(error.message, error.response?.status, "meta");
            enqueueSnackbar(message || "Erro ao buscar metas", { variant: "error" });
            console.error("Erro ao buscar metas:", error);
            setMetas([]);
            setSummary(null);
        } finally {
            setLoadingMetas(false);
        }
    };

    React.useEffect(() => {
        fetchMetas();
    }, []);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredMetas.length / itemsPerPage);
    const paginatedMetas = filteredMetas.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    React.useEffect(() => {
        let result = metas;

        if (search) {
            const normalizedSearch = search.toLowerCase();
            result = result.filter(
                (meta) =>
                    meta.month_ref.includes(search) ||
                    meta.user.username.toLowerCase().includes(normalizedSearch) ||
                    meta.user.email.toLowerCase().includes(normalizedSearch)
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
                month_ref: new Date().toISOString().split("T")[0].slice(0, 7),
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
            if (!formData.month_ref || !formData.meta_perc) {
                enqueueSnackbar("Preencha todos os campos obrigatorios", {
                    variant: "warning",
                });
                setLoading(false);
                return;
            }

            const metaValue = parseInt(formData.meta_perc, 10);
            if (isNaN(metaValue) || metaValue < 0 || metaValue > 1000) {
                enqueueSnackbar("Meta deve ser um numero entre 0 e 1000", {
                    variant: "warning",
                });
                setLoading(false);
                return;
            }

            const normalizedMonthRef =
                formData.month_ref?.length === 7 ? `${formData.month_ref}-01` : formData.month_ref;

            if (dialogMode === "create") {
                await metaService.create(normalizedMonthRef, metaValue);
                enqueueSnackbar("Meta criada com sucesso!", { variant: "success" });
                await fetchMetas();
            } else if (dialogMode === "edit" && selectedMeta) {
                await metaService.update(selectedMeta.id, normalizedMonthRef, metaValue);
                enqueueSnackbar("Meta atualizada com sucesso!", { variant: "success" });
                await fetchMetas();
            }

            handleCloseDialog();
        } catch (error) {
            const message = interpretApiError(error.message, error.response?.status, "meta");
            enqueueSnackbar(message || "Erro ao processar operacao", { variant: "error" });
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

    const getMetaStatusColor = (metaPerc) => {
        if (metaPerc >= 150) return "error";
        if (metaPerc >= 120) return "warning";
        return "success";
    };

    const totalMetas = summary?.total_metas ?? metas.length;
    const avgMeta =
        summary?.media_metas !== undefined
            ? Number(summary.media_metas).toFixed(0)
            : metas.length
                ? (metas.reduce((sum, m) => sum + m.meta_perc, 0) / metas.length).toFixed(0)
                : "0";
    const completedMetas = summary?.metas_acima_100 ?? metas.filter((m) => m.progress >= 100).length;

    return (
        <Container>
            <Box className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: "Transacoes", path: "/material/customer" },
                        { name: "Metas Mensais" },
                    ]}
                />
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard elevation={0}>
                        <div className="stat-label">TOTAL DE METAS</div>
                        <div className="stat-value">{totalMetas}</div>
                        <div className="stat-label">Cadastradas no periodo</div>
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
                        <div className="stat-label">META MEDIA</div>
                        <div className="stat-value">{avgMeta}%</div>
                        <div className="stat-label">Percentual medio</div>
                    </StatCard>
                </Grid>
            </Grid>

            <FilterCard>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Buscar por Mes ou Responsavel"
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

            {viewMode === "card" && (
                <Box>
                    {loadingMetas ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : paginatedMetas.length > 0 ? (
                        paginatedMetas.map((meta) => (
                            <MetaCard key={meta.id}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            {meta.month_ref}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                            Responsavel: {meta.user.username}
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
                                        </Box>
                                    </Grid>
                                </Grid>
                            </MetaCard>
                        ))
                    ) : (
                        <Alert severity="info">
                            <AlertTitle>Nenhuma meta encontrada</AlertTitle>
                            Crie uma nova meta para comecar a acompanhar seu progresso
                        </Alert>
                    )}

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

            {viewMode === "table" && (
                <SimpleCard title="Metas Mensais">
                    <MetaTable>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Mes</TableCell>
                                    <TableCell>Responsavel</TableCell>
                                    <TableCell align="right">Meta (%)</TableCell>
                                    <TableCell align="center">Progresso</TableCell>
                                    <TableCell align="center">Ultima Atualizacao</TableCell>
                                    <TableCell align="center">Acoes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingMetas ? (
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
                            label="Mes de Referencia"
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
        </Container>
    );
}
