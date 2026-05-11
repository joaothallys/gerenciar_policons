import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";

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

export default function ExportTransactionsDialog({
  open,
  onClose,
  filterUsers,
  loadingFilterUsers,
  onExport,
  isExporting,
}) {
  const [exportFilters, setExportFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
    transactionTypeId: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setExportFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExport = async () => {
    await onExport(exportFilters);
    handleClose();
  };

  const handleClose = () => {
    setExportFilters({
      userId: "",
      startDate: "",
      endDate: "",
      transactionTypeId: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Exportar Transações
          </Typography>
          <CloseIcon
            onClick={handleClose}
            sx={{ cursor: "pointer", fontSize: 20 }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Selecione os filtros para exportar as transações em formato Excel
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Select
              fullWidth
              size="small"
              name="userId"
              value={exportFilters.userId}
              onChange={handleFilterChange}
              displayEmpty
              disabled={loadingFilterUsers}
              label="Usuário"
            >
              <MenuItem value="">
                {loadingFilterUsers ? "Carregando..." : "Todos os Usuários"}
              </MenuItem>
              {filterUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Data Início"
              name="startDate"
              value={exportFilters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Data Fim"
              name="endDate"
              value={exportFilters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Select
              fullWidth
              size="small"
              name="transactionTypeId"
              value={exportFilters.transactionTypeId}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="">Todos os Tipos de Transação</MenuItem>
              {TRANSACTION_TYPES.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          color="primary"
          disabled={isExporting}
          startIcon={
            isExporting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
        >
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
