import { Box, Button, Card, CircularProgress, Alert, AlertTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, Grid, Typography, IconButton } from "@mui/material";
import { Breadcrumb, SimpleCard } from "app/components";
import { styled } from "@mui/material/styles";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const UploadCard = styled(Card)({
  padding: "40px",
  textAlign: "center",
  backgroundColor: "rgba(102, 126, 234, 0.05)",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  marginBottom: "30px",
  border: "none !important",
  boxShadow: "none !important",
  outline: "none !important",
  "&:hover": {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    boxShadow: "none !important",
  },
  "&:focus": {
    outline: "none !important",
    boxShadow: "none !important",
  },
});

const TRANSACTION_TYPES = [
  { id: 1, name: "Pontos Ganhos - Meta" },
  { id: 2, name: "Pontos Ganhos - Trimestral" },
  { id: 3, name: "Pontos Ganhos - Jogos" },
  { id: 4, name: "Pontos Perdidos - Frequência" },
  { id: 5, name: "Pontos Perdidos - Organização" },
  { id: 6, name: "Pontos Perdidos - Trimestral" },
  { id: 7, name: "Pontos Gastos - Loja Virtual" },
  { id: 8, name: "Pontos Gastos - Loja Física" },
  { id: 9, name: "Pontos Ganhos - Cursos" },
  { id: 10, name: "Pontos Ganhos - Academia" },
];

export default function ImportPage() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(1);

  const handleFileSelect = (selectedFile) => {
    const validFormats = [".xlsx", ".xls", ".csv"];
    const fileName = selectedFile.name.toLowerCase();
    const isValidFormat = validFormats.some((fmt) => fileName.endsWith(fmt));

    if (!isValidFormat) {
      toast.warning("Apenas arquivos XLSX, XLS ou CSV são aceitos");
      return;
    }

    setFile(selectedFile);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        if (rows.length === 0) {
          toast.warning("Arquivo vazio");
          return;
        }

        const firstRow = rows[0];
        const requiredColumns = ["email", "data", "points"];
        const hasAllColumns = requiredColumns.every((col) => col in firstRow);

        if (!hasAllColumns) {
          toast.warning("Arquivo deve conter as colunas: email, data, points");
          return;
        }

        setPreview(rows.slice(0, 5));
        toast.info(`${rows.length} registro(s) detectado(s). Mostrando preview dos 5 primeiros.`);
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
      console.error("Error:", error);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetFile = () => {
    setFile(null);
    setPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) {
      toast.warning("Nenhum arquivo selecionado");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.warning("Token não encontrado. Faça login novamente.");
        resetFile();
        return;
      }

      const runtimeApiHost = window.__ENV__?.VITE_REACT_APP_API_HOST;
      const apiHost = runtimeApiHost || import.meta.env.VITE_REACT_APP_API_HOST;

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${apiHost}/transactions/upload?type_id=${selectedTypeId}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData?.error || responseData?.message || "Erro ao importar dados";
        toast.error(errorMessage);
        resetFile();
        return;
      }

      toast.success(responseData?.message || `${preview.length} transações importadas com sucesso!`);
      setFile(null);
      setPreview([]);
    } catch (error) {
      toast.error(error?.message || "Erro ao importar dados");
      resetFile();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Ferramentas", path: "/transactions" },
            { name: "Importar Transações" },
          ]}
        />
      </Box>

      {/* Card de Seleção de Tipo */}
      <Card elevation={0} sx={{ p: 3, mb: 3, border: "1px solid #e0e0e0" }}>
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

      {/* Upload Area */}
      <SimpleCard title="Importar Transações">
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Formato esperado</AlertTitle>
          O arquivo deve conter as colunas: <strong>email, data, points</strong>
        </Alert>

        <UploadCard component="label" elevation={0}>
          <Box sx={{ fontSize: "16px", fontWeight: 600, mb: 1 }}>
            Clique ou arraste um arquivo
          </Box>
          <Box sx={{ fontSize: "13px", color: "text.secondary", mb: 3 }}>
            Suporta: XLSX, XLS, CSV
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              component="span"
              startIcon={<CloudUploadIcon fontSize="small" />}
            >
              Selecionar Arquivo
            </Button>
          </Box>
          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileSelect(selectedFile);
            }}
            style={{ outline: "none" }}
          />
        </UploadCard>

        {preview.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ fontSize: "16px", fontWeight: 600 }}>
                  Preview dos 5 primeiros registros
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                  title="Remover arquivo"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Data</strong></TableCell>
                      <TableCell align="right"><strong>Pontos</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.data}</TableCell>
                        <TableCell align="right">{row.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveFile}
                disabled={uploading}
                sx={{ flex: 1 }}
              >
                Remover
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleImport}
                disabled={uploading}
                sx={{ flex: 1, py: 1.5 }}
              >
                {uploading ? <CircularProgress size={24} /> : "Importar Arquivo"}
              </Button>
            </Box>
          </>
        )}
      </SimpleCard>
    </Container>
  );
}
