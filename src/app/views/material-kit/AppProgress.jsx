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
    Card,
    Grid,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Select,
    MenuItem,
    Chip,
    Paper,
    CardMedia,
    CardContent,
    Typography,
    Alert,
    AlertTitle,
    LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Breadcrumb, SimpleCard } from "app/components";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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

const ProductTable = styled(TableContainer)(({ theme }) => ({
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

const ProductCard = styled(Card)(({ theme }) => ({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
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

const PRODUCT_TYPES = [
    { id: 1, name: "Virtual" },
    { id: 2, name: "Físico" },
];

export default function ProductsPage() {
    const { enqueueSnackbar } = useSnackbar();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState("grid");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState("create");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [summary, setSummary] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    const itemsPerPage = 10;

    // Helper para decodificar JWT
    function parseJwt(token) {
        try {
            const payload = token.split(".")[1];
            const decoded = JSON.parse(
                decodeURIComponent(
                    atob(payload)
                        .split("")
                        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                        .join("")
                )
            );
            return decoded;
        } catch (e) {
            return null;
        }
    }

    // Buscar produtos da API
    useEffect(() => {
        async function fetchProducts() {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                enqueueSnackbar("Token não encontrado. Faça login novamente.", { variant: "warning" });
                return;
            }

            const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;
            const url = `${apiHost}/products?page=${page}&per_page=${itemsPerPage}&include_out_of_stock=true`;

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
                    enqueueSnackbar(`Erro ao buscar produtos: ${res.status}`, { variant: "error" });
                    setFetching(false);
                    return;
                }

                const json = await res.json();

                // Mapear resposta da API
                const mapped = (json.products || []).map((p) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    points: p.points,
                    type_id: p.type_id,
                    type_name: p.type_name,
                    imageURL: p.image_url,
                }));

                setProducts(mapped);
                setSummary(json.summary || null);
                setTotalPages(json.total_pages || 1);

                if (mapped.length > 0) {
                    enqueueSnackbar(`Produtos carregados: ${mapped.length}`, { variant: "success" });
                }
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
                enqueueSnackbar("Erro ao buscar produtos. Verifique o servidor.", { variant: "error" });
            } finally {
                setFetching(false);
            }
        }

        fetchProducts();
    }, [page, enqueueSnackbar]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        points: "",
        type_id: "1",
        imageURL: "",
    });
    const [uploadProgress, setUploadProgress] = useState(0);

    // Filtrar produtos (filtros client-side apenas)
    React.useEffect(() => {
        let result = products;

        if (search) {
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(search.toLowerCase()) ||
                    product.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (typeFilter) {
            result = result.filter((product) => product.type_id == typeFilter);
        }

        // Não fazer slice aqui, pois a paginação já vem da API
        setFilteredProducts(result);
    }, [search, typeFilter, products]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleTypeFilter = (e) => {
        setTypeFilter(e.target.value);
    };

    const handleOpenDialog = (mode, product = null) => {
        setDialogMode(mode);
        setSelectedProduct(product);

        if (mode === "create") {
            setFormData({
                name: "",
                description: "",
                points: "",
                type_id: "1",
                imageURL: "",
            });
        } else if (mode === "edit" && product) {
            setFormData({
                name: product.name,
                description: product.description,
                points: product.points.toString(),
                type_id: product.type_id.toString(),
                imageURL: product.imageURL,
            });
        }

        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProduct(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
            enqueueSnackbar("Por favor, selecione um arquivo de imagem válido", {
                variant: "warning",
            });
            return;
        }

        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            enqueueSnackbar("A imagem não pode exceder 5MB", {
                variant: "warning",
            });
            return;
        }

        // Simular upload com progresso
        setUploadProgress(0);

        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + Math.random() * 30;
            });
        }, 200);

        setTimeout(() => {
            clearInterval(progressInterval);
            // Armazenar o arquivo para enviar later
            // Gerar preview da imagem
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData((prev) => ({
                    ...prev,
                    imageFile: file,
                    imageURL: e.target.result, // Preview em base64 para exibição
                }));
            };
            reader.readAsDataURL(file);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);
        }, 500);
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            // Validações
            if (!formData.name || !formData.description || !formData.points) {
                enqueueSnackbar("Preencha todos os campos obrigatórios", {
                    variant: "warning",
                });
                setLoading(false);
                return;
            }

            if (isNaN(formData.points) || parseInt(formData.points) <= 0) {
                enqueueSnackbar("Pontos deve ser um número positivo", {
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

            if (dialogMode === "create") {
                // Preparar FormData para envio
                const formDataToSend = new FormData();
                formDataToSend.append("name", formData.name);
                formDataToSend.append("description", formData.description);
                formDataToSend.append("points", formData.points);
                formDataToSend.append("type_id", formData.type_id);

                // Se houver arquivo de imagem, adicionar
                if (formData.imageFile) {
                    formDataToSend.append("image", formData.imageFile);
                }

                const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;
                const res = await fetch(`${apiHost}/products`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formDataToSend,
                });

                if (!res.ok) {
                    const error = await res.text();
                    enqueueSnackbar(`Erro ao criar produto: ${res.status}`, { variant: "error" });
                    console.error("Erro:", error);
                    setLoading(false);
                    return;
                }

                const newProduct = await res.json();
                setProducts((prev) => [newProduct, ...prev]);
                enqueueSnackbar("Produto criado com sucesso!", { variant: "success" });
            } else if (dialogMode === "edit" && selectedProduct) {
                // Preparar dados para PUT
                const editData = {
                    name: formData.name,
                    description: formData.description,
                    points: parseInt(formData.points),
                    type_id: parseInt(formData.type_id),
                    image_url: formData.imageURL, // Usar a URL da imagem (seja preview ou existente)
                };

                const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;
                const res = await fetch(`${apiHost}/products/${selectedProduct.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editData),
                });

                if (!res.ok) {
                    const error = await res.text();
                    enqueueSnackbar(`Erro ao atualizar produto: ${res.status}`, { variant: "error" });
                    console.error("Erro:", error);
                    setLoading(false);
                    return;
                }

                const updatedProduct = await res.json();
                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === selectedProduct.id
                            ? {
                                ...updatedProduct,
                                imageURL: updatedProduct.image_url,
                            }
                            : p
                    )
                );
                enqueueSnackbar("Produto atualizado com sucesso!", {
                    variant: "success",
                });
            } else if (dialogMode === "delete" && selectedProduct) {
                // Deletar produto via API
                const apiHost = import.meta.env.VITE_REACT_APP_API_HOST;
                const res = await fetch(`${apiHost}/products/${selectedProduct.id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const error = await res.text();
                    enqueueSnackbar(`Erro ao deletar produto: ${res.status}`, { variant: "error" });
                    console.error("Erro:", error);
                    setLoading(false);
                    return;
                }

                setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
                enqueueSnackbar("Produto deletado com sucesso!", { variant: "success" });
            }

            handleCloseDialog();
        } catch (error) {
            enqueueSnackbar("Erro ao processar operação", { variant: "error" });
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (typeId) => {
        return typeId === 1 ? "primary" : "secondary";
    };

    // Usar summary da API quando disponível
    const displayStats = summary ? {
        totalProducts: summary.total_products || 0,
        virtualProducts: summary.total_virtual || 0,
        physicalProducts: summary.total_physical || 0,
    } : {
        totalProducts: products.length,
        virtualProducts: 0,
        physicalProducts: 0,
    };

    // Produtos já vêm paginados da API, apenas aplicar filtros client-side
    const paginatedProducts = filteredProducts;

    return (
        <Container>
            {/* Breadcrumb */}
            <Box className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: "Dashboard", path: "/dashboard/default" },
                        { name: "Produtos" },
                    ]}
                />
            </Box>

            {/* Estatísticas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard elevation={0}>
                        <div className="stat-label">TOTAL DE PRODUTOS</div>
                        <div className="stat-value">{displayStats.totalProducts}</div>
                        <div className="stat-label">Cadastrados no sistema</div>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        elevation={0}
                        sx={{
                            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                        }}
                    >
                        <div className="stat-label">VIRTUAIS</div>
                        <div className="stat-value">{displayStats.virtualProducts}</div>
                        <div className="stat-label">Produtos digitais</div>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        elevation={0}
                        sx={{
                            background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
                        }}
                    >
                        <div className="stat-label">FÍSICOS</div>
                        <div className="stat-value">{displayStats.physicalProducts}</div>
                        <div className="stat-label">Produtos entregáveis</div>
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
                            label="Buscar por Nome ou Descrição"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Digite o nome ou descrição..."
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Select
                            fullWidth
                            size="small"
                            value={typeFilter}
                            onChange={handleTypeFilter}
                            displayEmpty
                        >
                            <MenuItem value="">Todos os Tipos</MenuItem>
                            {PRODUCT_TYPES.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog("create")}
                        >
                            Novo Produto
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                fullWidth
                                variant={viewMode === "table" ? "contained" : "outlined"}
                                onClick={() => setViewMode("table")}
                            >
                                Tabela
                            </Button>
                            <Button
                                fullWidth
                                variant={viewMode === "grid" ? "contained" : "outlined"}
                                onClick={() => setViewMode("grid")}
                            >
                                Grade
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </FilterCard>

            {/* Visualização em Tabela */}
            {viewMode === "table" && (
                <SimpleCard title="Listagem de Produtos">
                    <ProductTable>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">ID</TableCell>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell align="right">Pontos</TableCell>
                                    <TableCell align="center">Tipo</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fetching ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedProducts.length > 0 ? (
                                    paginatedProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                                                #{product.id}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                                            <TableCell>{product.description}</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={product.points.toLocaleString()}
                                                    variant="outlined"
                                                    color="primary"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={product.type_name}
                                                    color={getTypeColor(product.type_id)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => handleOpenDialog("edit", product)}
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => handleOpenDialog("delete", product)}
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
                                            Nenhum produto encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ProductTable>

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

            {/* Visualização em Grade */}
            {viewMode === "grid" && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Produtos Disponíveis
                    </Typography>
                    <Grid container spacing={3}>
                        {paginatedProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} key={product.id}>
                                <ProductCard>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={product.imageURL}
                                        alt={product.name}
                                        sx={{ objectFit: "cover" }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h6" sx={{ fontWeight: 600 }}>
                                            {product.name}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                            {product.description}
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                                            <Chip
                                                label={`${product.points.toLocaleString()} pts`}
                                                color="primary"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                            <Chip
                                                label={product.type_name}
                                                color={getTypeColor(product.type_id)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Button
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenDialog("edit", product)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDialog("delete", product)}
                                            >
                                                Deletar
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </ProductCard>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Paginação Grid */}
                    {totalPages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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

            {/* Dialog para Criar/Editar */}
            <Dialog
                open={openDialog && (dialogMode === "create" || dialogMode === "edit")}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {dialogMode === "create" ? "Novo Produto" : "Editar Produto"}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Nome do Produto"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Descrição"
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            multiline
                            rows={3}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Pontos Necessários"
                            name="points"
                            type="number"
                            value={formData.points}
                            onChange={handleFormChange}
                            required
                            inputProps={{ min: "1" }}
                        />
                        <Select
                            fullWidth
                            name="type_id"
                            value={formData.type_id}
                            onChange={handleFormChange}
                        >
                            {PRODUCT_TYPES.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: "none" }}
                                id="image-upload-input"
                                type="file"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="image-upload-input" style={{ width: "100%" }}>
                                <Button
                                    variant="outlined"
                                    component="span"
                                    fullWidth
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ mb: 1 }}
                                >
                                    Selecionar Imagem
                                </Button>
                            </label>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                                        Upload: {Math.round(uploadProgress)}%
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={uploadProgress}
                                        sx={{ borderRadius: 1 }}
                                    />
                                </Box>
                            )}
                        </Box>
                        {formData.imageURL && (
                            <Box>
                                <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
                                    ✓ Imagem selecionada
                                </Typography>
                                <Box
                                    component="img"
                                    src={formData.imageURL}
                                    alt="Preview"
                                    sx={{
                                        maxWidth: "100%",
                                        maxHeight: "200px",
                                        borderRadius: 1,
                                        border: "2px solid #e0e0e0",
                                    }}
                                />
                            </Box>
                        )}
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
                        Tem certeza que deseja deletar o produto <strong>{selectedProduct?.name}</strong>?
                        Esta ação não pode ser desfeita.
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
