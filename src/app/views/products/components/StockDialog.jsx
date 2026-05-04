import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function StockDialog({
  open,
  stockQuantity,
  loading,
  onQuantityChange,
  onSubmit,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Atualizar Estoque</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert severity="info" sx={{ fontSize: "12px" }}>
            Digite um número positivo para adicionar ou negativo para remover
          </Alert>
          <TextField
            fullWidth
            label="Quantidade"
            type="number"
            value={stockQuantity}
            onChange={onQuantityChange}
            autoFocus
            placeholder="Ex: 10 ou -5"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Atualizar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
