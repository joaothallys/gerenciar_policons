import { Box, Button, Card, CircularProgress, Alert, AlertTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, Grid, Typography, IconButton, TextField } from "@mui/material";
import { Breadcrumb, SimpleCard } from "app/components";
import { styled } from "@mui/material/styles";
import { useState, useRef, useEffect } from "react";
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

const formatImportDate = (value) => {
  if (value === null || value === undefined || value === "") return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleDateString("pt-BR");
  }

  if (typeof value === "number" && value > 30000 && value < 100000) {
    const utcDays = Math.floor(value - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  const str = String(value).trim();

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    return str;
  }

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  return str;
};

const extractRows = (worksheet) =>
  XLSX.utils
    .sheet_to_json(worksheet, { defval: "", raw: false, dateNF: "dd/mm/yyyy" })
    .filter((row) =>
      Object.keys(row).some((key) => String(row[key]).trim() !== "")
    );

const parseFileRows = (data, fileName) => {
  const isCsv = fileName.endsWith(".csv");

  const readOptions = { type: "array", cellDates: true };

  if (!isCsv) {
    const workbook = XLSX.read(data, readOptions);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return extractRows(worksheet);
  }

  for (const delimiter of [";", ",", "\t"]) {
    const workbook = XLSX.read(data, { ...readOptions, FS: delimiter });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = extractRows(worksheet);

    if (rows.length > 0 && Object.keys(rows[0]).length >= 3) {
      return rows;
    }
  }

  const workbook = XLSX.read(data, readOptions);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return extractRows(worksheet);
};

const normalizeColumnName = (key) =>
  String(key).trim().replace(/^\uFEFF/, "");

const findColumnKey = (row, targetName) => {
  const normalizedTarget = normalizeColumnName(targetName).toLowerCase();
  return Object.keys(row).find(
    (key) => normalizeColumnName(key).toLowerCase() === normalizedTarget
  );
};

const getDetectedColumns = (row) =>
  Object.keys(row).map(normalizeColumnName).filter(Boolean);

const TYPE_COLUMN_HINTS = {
  1: ["pontos metas", "pontos meta", "meta"],
  2: ["trimestral"],
  3: ["jogos"],
  4: ["ponto eletronico", "ponto eletrônico", "frequencia", "frequência"],
  5: ["penalidades organização empresa", "organizacao", "organização"],
  6: ["penalidades trimestral"],
  9: ["cursos"],
  10: ["academia"],
};

const getPointsColumnOptions = (row) => {
  if (!row) return [];

  return getDetectedColumns(row).filter(
    (col) => !["email", "data"].includes(col.toLowerCase())
  );
};

const suggestPointsColumn = (options, typeId, currentValue = "") => {
  if (
    currentValue &&
    options.some((option) => option.toLowerCase() === currentValue.toLowerCase())
  ) {
    return currentValue;
  }

  const hints = TYPE_COLUMN_HINTS[typeId] || [];

  for (const hint of hints) {
    const match = options.find(
      (option) =>
        option.toLowerCase() === hint || option.toLowerCase().includes(hint)
    );
    if (match) return match;
  }

  const pointsMatch = options.find((option) => option.toLowerCase() === "points");
  if (pointsMatch) return pointsMatch;

  return options[0] || "";
};

const normalizeImportRows = (rows, pointsColumnName) => {
  if (!rows.length) return [];

  const pointsKey = (pointsColumnName || "points").trim() || "points";
  const firstRow = rows[0];
  const emailKey = findColumnKey(firstRow, "email");
  const dataKey = findColumnKey(firstRow, "data");
  const pointsKeyActual = findColumnKey(firstRow, pointsKey);

  return rows.map((row) => {
    const normalized = {};

    if (emailKey !== undefined) normalized.email = row[emailKey];
    if (dataKey !== undefined) normalized.data = formatImportDate(row[dataKey]);
    if (pointsKeyActual !== undefined) normalized[pointsKey] = row[pointsKeyActual];

    return normalized;
  });
};

export default function ImportPage() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(1);
  const [pointsColumn, setPointsColumn] = useState("");
  const [availablePointsColumns, setAvailablePointsColumns] = useState([]);
  const [rawParsedRows, setRawParsedRows] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  const getPointsColumnName = () => pointsColumn.trim();

  const validateRows = (rows, columnName, sourceRow = null) => {
    if (!columnName) {
      return {
        valid: false,
        message: "Selecione a coluna de pontos do arquivo",
      };
    }

    if (rows.length === 0) {
      return { valid: false, message: "Arquivo vazio" };
    }

    const firstRow = rows[0];
    const requiredColumns = ["email", "data", columnName];
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow));

    if (missingColumns.length > 0) {
      const detectedColumns = sourceRow ? getDetectedColumns(sourceRow) : getDetectedColumns(firstRow);
      return {
        valid: false,
        message: `Arquivo deve conter as colunas: email, data, ${columnName}. Colunas encontradas: ${
          detectedColumns.length > 0 ? detectedColumns.join(", ") : "nenhuma"
        }`,
      };
    }

    return { valid: true };
  };

  const applyPreview = (rows, columnName, sourceRow = null, showToast = false) => {
    const validation = validateRows(rows, columnName, sourceRow);

    if (!validation.valid) {
      setPreview([]);
      if (showToast) {
        toast.warning(validation.message);
      }
      return false;
    }

    setPreview(rows.slice(0, 5));
    setTotalRows(rows.length);
    if (showToast) {
      toast.info(`${rows.length} registro(s) detectado(s). Mostrando preview dos 5 primeiros.`);
    }
    return true;
  };

  useEffect(() => {
    if (rawParsedRows.length === 0) return;

    const columnName = getPointsColumnName();
    const normalizedRows = normalizeImportRows(rawParsedRows, columnName);
    setParsedRows(normalizedRows);
    applyPreview(normalizedRows, columnName, rawParsedRows[0]);
  }, [pointsColumn, rawParsedRows]);

  useEffect(() => {
    if (rawParsedRows.length === 0) return;

    const options = getPointsColumnOptions(rawParsedRows[0]);
    const suggested = suggestPointsColumn(options, selectedTypeId, pointsColumn);

    if (suggested && suggested !== pointsColumn) {
      setPointsColumn(suggested);
    }
  }, [selectedTypeId, rawParsedRows]);

  const clearFile = () => {
    setFile(null);
    setPreview([]);
    setRawParsedRows([]);
    setParsedRows([]);
    setAvailablePointsColumns([]);
    setPointsColumn("");
    setTotalRows(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        const rows = parseFileRows(data, fileName);

        if (rows.length === 0) {
          toast.warning("Arquivo vazio");
          return;
        }

        const options = getPointsColumnOptions(rows[0]);
        const suggested = suggestPointsColumn(options, selectedTypeId, pointsColumn);

        setRawParsedRows(rows);
        setAvailablePointsColumns(options);
        setPointsColumn(suggested);

        if (!suggested) {
          toast.info("Arquivo carregado. Selecione a coluna de pontos para continuar.");
          return;
        }

        const normalizedRows = normalizeImportRows(rows, suggested);
        setParsedRows(normalizedRows);
        applyPreview(normalizedRows, suggested, rows[0], true);
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      toast.error("Erro ao processar arquivo");
      console.error("Error:", error);
    }
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) {
      toast.warning(
        getPointsColumnName()
          ? "Nenhum arquivo válido para importar"
          : "Selecione a coluna de pontos antes de importar"
      );
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.warning("Token não encontrado. Faça login novamente.");
        return;
      }

      const runtimeApiHost = window.__ENV__?.VITE_REACT_APP_API_HOST;
      const apiHost = runtimeApiHost || import.meta.env.VITE_REACT_APP_API_HOST;

      const formData = new FormData();
      formData.append("file", file);

      const params = new URLSearchParams({
        type_id: String(selectedTypeId),
        points_column: getPointsColumnName(),
      });

      const response = await fetch(
        `${apiHost}/transactions/upload?${params.toString()}`,
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
        return;
      }

      toast.success(responseData?.message || `${totalRows} transações importadas com sucesso!`);
    } catch (error) {
      toast.error(error?.message || "Erro ao importar dados");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Ferramentas", path: "/transactions" },
            { name: "Importar Transações" },
          ]}
        />
      </Box>

      <Card elevation={0} sx={{ p: 3, mb: 3, border: "1px solid #e0e0e0" }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={5}>
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

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Coluna de Pontos *
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {availablePointsColumns.length > 0
                ? "Escolha qual coluna do arquivo será importada"
                : "Será preenchida automaticamente após selecionar o arquivo"}
            </Typography>
            {availablePointsColumns.length > 0 ? (
              <Select
                fullWidth
                displayEmpty
                value={pointsColumn}
                onChange={(e) => setPointsColumn(e.target.value)}
              >
                <MenuItem value="" disabled>
                  Selecione a coluna
                </MenuItem>
                {availablePointsColumns.map((column) => (
                  <MenuItem key={column} value={column}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <TextField
                fullWidth
                disabled
                placeholder="Selecione um arquivo primeiro"
                helperText="O arquivo pode ter várias colunas de pontos"
              />
            )}
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1, height: "100%" }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Configuração atual:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                {TRANSACTION_TYPES.find((t) => t.id === selectedTypeId)?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Coluna:{" "}
                <strong>{getPointsColumnName() || "não selecionada"}</strong>
              </Typography>
              {availablePointsColumns.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {availablePointsColumns.length} coluna(s) de pontos detectada(s)
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Card>

      <SimpleCard title="Importar Transações">
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Formato esperado</AlertTitle>
          O arquivo deve conter as colunas <strong>email</strong>, <strong>data</strong> e
          pelo menos uma coluna de pontos.
          {availablePointsColumns.length > 0 && (
            <>
              {" "}
              Colunas de pontos detectadas:{" "}
              <strong>{availablePointsColumns.join(", ")}</strong>
            </>
          )}
        </Alert>

        {file && preview.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Selecione a coluna de pontos correspondente ao tipo de transação para visualizar o
            preview.
          </Alert>
        )}

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
                  onClick={clearFile}
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
                      <TableCell align="right">
                        <strong>{getPointsColumnName()}</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.data}</TableCell>
                        <TableCell align="right">
                          {row[getPointsColumnName()]}
                        </TableCell>
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
                onClick={clearFile}
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
