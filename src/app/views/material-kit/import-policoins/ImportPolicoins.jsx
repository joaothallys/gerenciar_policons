import React, { useState } from "react";
import {
    Box,
    Card,
    Grid,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Paper,
    Alert,
    AlertTitle,
    CircularProgress,
    Select,
    MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Breadcrumb, SimpleCard } from "app/components";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DownloadIcon from "@mui/icons-material/Download";
import { useSnackbar } from "notistack";
import * as XLSX from "xlsx";

const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
        marginBottom: "30px",
        [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
    },
}));

const UploadCard = styled(Card)(({ theme }) => ({
    padding: "40px",
    textAlign: "center",
    border: "2px dashed #667eea",
    backgroundColor: "#f8f9ff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
        borderColor: "#764ba2",
        backgroundColor: "#f0f0ff",
    },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
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

const PreviewTable = styled(TableContainer)(({ theme }) => ({
    marginTop: "20px",
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

const TemplateDownloadCard = styled(Card)(({ theme }) => ({
    padding: "20px",
    marginBottom: "30px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        gap: "15px",
    },
}));

const TRANSACTION_TYPES = [
    { id: 1, name: "Pontos Ganhos - Meta" },
    { id: 2, name: "Pontos Ganhos - Trimestral" },
    { id: 3, name: "Pontos Ganhos - Jogos" },
    { id: 4, name: "Pontos Perdidos - Frequência" },
    { id: 5, name: "Pontos Perdidos - Organização" },
    { id: 6, name: "Pontos Perdidos - Trimestral" },
    { id: 7, name: "Pontos Gastos - Loja Virtual" },
    { id: 8, name: "Pontos Gastos - Loja Física" },
];

export default function ImportPolicoins() {
    const { enqueueSnackbar } = useSnackbar();
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [preview, setPreview] = useState([]);
    const [openPreview, setOpenPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [importStatus, setImportStatus] = useState(null);
    const [selectedTypeId, setSelectedTypeId] = useState(1);

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const validTypes = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv",
            ];

            if (!validTypes.includes(selectedFile.type)) {
                enqueueSnackbar("Por favor, selecione um arquivo CSV ou XLSX válido", {
                    variant: "error",
                });
                return;
            }

            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (selectedFile) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const fileData = e.target.result;
                const workbook = XLSX.read(fileData, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                // Validar colunas obrigatórias
                if (json.length === 0) {
                    enqueueSnackbar("A planilha está vazia", { variant: "error" });
                    return;
                }

                const requiredColumns = ["email", "data", "points"];
                const firstRow = json[0];
                const hasAllColumns = requiredColumns.every((col) =>
                    Object.keys(firstRow).some(
                        (key) => key.toLowerCase() === col.toLowerCase()
                    )
                );

                if (!hasAllColumns) {
                    enqueueSnackbar(
                        "A planilha deve conter as colunas: email, data, points",
                        { variant: "error" }
                    );
                    return;
                }

                // Normalizar dados
                const normalizedData = json.map((row) => ({
                    email: row.email || row.Email || "",
                    data: row.data || row.Data || "",
                    points: parseInt(row.points || row.Points || 0),
                    status: "pending",
                }));

                setData(normalizedData);
                setPreview(normalizedData.slice(0, 5)); // Mostrar apenas os 5 primeiros
                enqueueSnackbar(`${normalizedData.length} registros carregados`, {
                    variant: "success",
                });
            } catch (error) {
                console.error("Erro ao processar arquivo:", error);
                enqueueSnackbar("Erro ao processar arquivo. Verifique o formato.", {
                    variant: "error",
                });
            }
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    const handlePreview = () => {
        if (data.length === 0) {
            enqueueSnackbar("Nenhum arquivo carregado", { variant: "warning" });
            return;
        }
        setOpenPreview(true);
    };

    const handleImport = async () => {
        if (data.length === 0) {
            enqueueSnackbar("Nenhum dado para importar", { variant: "warning" });
            return;
        }

        setLoading(true);

        try {
            // Validar dados
            const validatedData = data.filter((row) => {
                return row.email && row.data && row.points;
            });

            if (validatedData.length === 0) {
                enqueueSnackbar("Nenhum registro válido para importar", {
                    variant: "error",
                });
                return;
            }

            // Simular chamada à API
            // await axios.post("/transactions/upload", {
            //   file: file,
            //   type_id: selectedTypeId
            // });

            setImportStatus({
                total: validatedData.length,
                success: validatedData.length,
                errors: data.length - validatedData.length,
            });

            enqueueSnackbar(
                `${validatedData.length} transações importadas com sucesso!`,
                { variant: "success" }
            );

            // Limpar dados após sucesso
            setTimeout(() => {
                setFile(null);
                setData([]);
                setPreview([]);
                setOpenPreview(false);
                setImportStatus(null);
            }, 2000);
        } catch (error) {
            console.error("Erro ao importar:", error);
            enqueueSnackbar("Erro ao importar dados", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                email: "joao@example.com",
                data: "2025-11-15",
                points: 500,
            },
            {
                email: "maria@example.com",
                data: "2025-11-15",
                points: 300,
            },
            {
                email: "pedro@example.com",
                data: "2025-11-15",
                points: 250,
            },
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transações");

        // Ajustar largura das colunas
        ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 10 }];

        XLSX.writeFile(wb, "template_importar_policoins.xlsx");
        enqueueSnackbar("Template baixado com sucesso!", { variant: "success" });
    };

    return (
        <Container>
            {/* Breadcrumb */}
            <Box className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: "Dashboard", path: "/dashboard/default" },
                        { name: "Importar Policoins" },
                    ]}
                />
            </Box>

            {/* Status da Importação */}
            {importStatus && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    <AlertTitle>Importação Concluída!</AlertTitle>
                    {importStatus.success} registros importados com sucesso
                    {importStatus.errors > 0 && ` • ${importStatus.errors} registros ignorados`}
                </Alert>
            )}

            {/* Cartão de Template */}
            <TemplateDownloadCard elevation={0}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        Precisa de um modelo?
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Baixe nosso template em Excel com as colunas corretas e exemplos de dados
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={downloadTemplate}
                >
                    Baixar Template
                </Button>
            </TemplateDownloadCard>

            {/* Card de Seleção de Tipo */}
            <Card sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={8}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Tipo de Transação *
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Selecione o tipo de transação que será importada
                        </Typography>
                        <Select
                            fullWidth
                            value={selectedTypeId}
                            onChange={(e) => setSelectedTypeId(e.target.value)}
                        >
                            {TRANSACTION_TYPES.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.id} - {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                Tipo Selecionado:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {TRANSACTION_TYPES.find((t) => t.id === selectedTypeId)?.name}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Card de Upload */}
            <SimpleCard title="Importar Transações via Planilha">
                <Box component="label" htmlFor="file-upload" sx={{ display: "block" }}>
                    <UploadCard>
                        <CloudUploadIcon sx={{ fontSize: 48, color: "#667eea", mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            {file ? file.name : "Clique ou arraste uma planilha aqui"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Formatos suportados: CSV, XLSX
                        </Typography>
                        <input
                            id="file-upload"
                            type="file"
                            hidden
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileSelect}
                        />
                    </UploadCard>
                </Box>

                {/* Instruções */}
                <Alert severity="info" sx={{ mt: 3 }}>
                    <AlertTitle>Como usar</AlertTitle>
                    A planilha deve conter 3 colunas obrigatórias:
                    <br />
                    <strong>1. email</strong> - Email do usuário (ex: joao@example.com)
                    <br />
                    <strong>2. data</strong> - Data da transação (formato: YYYY-MM-DD)
                    <br />
                    <strong>3. points</strong> - Quantidade de pontos (positivo ou negativo)
                </Alert>

                {/* Botões de Ação */}
                {data.length > 0 && (
                    <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handlePreview}
                            disabled={loading}
                        >
                            Visualizar Preview ({data.length} registros)
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleImport}
                            disabled={loading}
                            startIcon={loading && <CircularProgress size={20} />}
                        >
                            {loading ? "Importando..." : "Importar Agora"}
                        </Button>
                    </Box>
                )}
            </SimpleCard>

            {/* Dialog de Preview */}
            <Dialog
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Preview da Importação</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Mostrando os 5 primeiros registros de {data.length} total
                        </Alert>

                        <PreviewTable>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Email</TableCell>
                                        <TableCell align="center">Data</TableCell>
                                        <TableCell align="right">Pontos</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {preview.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.email}</TableCell>
                                            <TableCell align="center">{row.data}</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={row.points.toLocaleString()}
                                                    color={row.points > 0 ? "success" : "error"}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </PreviewTable>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPreview(false)}>Fechar</Button>
                    <Button
                        onClick={handleImport}
                        variant="contained"
                        color="success"
                        disabled={loading}
                    >
                        Confirmar Importação
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
