import { Box, Button, Card, CircularProgress, Alert, AlertTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Breadcrumb, SimpleCard } from "app/components";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { useSnackbar } from "notistack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import * as XLSX from "xlsx";
import { transactionService } from "app/services/transactionService";
import { interpretApiError } from "app/utils/apiErrorHandler";

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
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  marginBottom: "30px",
  "&:hover": {
    borderColor: "#764ba2",
    backgroundColor: "rgba(102, 126, 234, 0.05)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "24px",
  },
}));

export default function ImportPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar formato
    const validFormats = [".xlsx", ".xls", ".csv"];
    const fileName = file.name.toLowerCase();
    const isValidFormat = validFormats.some((fmt) => fileName.endsWith(fmt));

    if (!isValidFormat) {
      enqueueSnackbar("Apenas arquivos XLSX, XLS ou CSV são aceitos", {
        variant: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        // Validar colunas obrigatórias
        if (rows.length === 0) {
          enqueueSnackbar("Arquivo vazio", { variant: "warning" });
          return;
        }

        const firstRow = rows[0];
        const requiredColumns = ["email", "data", "points"];
        const hasAllColumns = requiredColumns.every((col) => col in firstRow);

        if (!hasAllColumns) {
          enqueueSnackbar(
            "Arquivo deve conter as colunas: email, data, points",
            { variant: "warning" }
          );
          return;
        }

        // Mostrar preview dos primeiros 5 registros
        setPreview(rows.slice(0, 5));
        enqueueSnackbar(
          `${rows.length} registro(s) detectado(s). Mostrando preview dos 5 primeiros.`,
          { variant: "info" }
        );
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      enqueueSnackbar("Erro ao processar arquivo", { variant: "error" });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      enqueueSnackbar("Nenhum arquivo selecionado", { variant: "warning" });
      return;
    }

    try {
      setUploading(true);
      // TODO: Implementar upload em lote
      // Por agora, apenas simular
      enqueueSnackbar("Importação iniciada...", { variant: "info" });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      enqueueSnackbar("Importação concluída com sucesso!", {
        variant: "success",
      });
      setPreview([]);
    } catch (error) {
      const message = interpretApiError(
        error.message,
        error.response?.status,
        "import"
      );
      enqueueSnackbar(message, { variant: "error" });
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
            { name: "Importar Policoins", path: "/import" },
            { name: "Importar" },
          ]}
        />
      </Box>

      {/* Upload Area */}
      <SimpleCard title="Importar Transações">
        <UploadCard component="label">
          <CloudUploadIcon sx={{ fontSize: 48, color: "#667eea", mb: 2 }} />
          <Box sx={{ fontSize: "18px", fontWeight: 600, mb: 1 }}>
            Clique ou arraste um arquivo
          </Box>
          <Box sx={{ fontSize: "14px", color: "text.secondary", mb: 2 }}>
            Suporta: XLSX, XLS, CSV
          </Box>
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
          >
            Selecionar Arquivo
          </Button>
          <input
            hidden
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
          />
        </UploadCard>

        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Formato esperado</AlertTitle>
          O arquivo deve conter as colunas: <strong>email, data, points</strong>
        </Alert>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {preview.length > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ fontSize: "16px", fontWeight: 600, mb: 2 }}>
                Preview dos 5 primeiros registros
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

            <Button
              variant="contained"
              color="primary"
              onClick={handleImport}
              disabled={uploading}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {uploading ? <CircularProgress size={24} /> : "Importar Arquivo"}
            </Button>
          </>
        )}
      </SimpleCard>
    </Container>
  );
}
