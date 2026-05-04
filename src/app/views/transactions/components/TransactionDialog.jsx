import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { TRANSACTION_TYPES, PAYMENT_METHODS } from "app/constants";

export default function TransactionDialog({
  open,
  editingId,
  formData,
  users,
  products,
  loadingUsers,
  loadingProducts,
  loading,
  isPointsGainedType,
  totalProductsPages,
  productsPage,
  onFormChange,
  onSubmit,
  onClose,
  onProductsScroll,
  onProductsOpen,
  setProductsPage,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          margin: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: "18px", sm: "20px" } }}>
        {editingId ? "Editar Transação" : "Nova Transação"}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Select
            fullWidth
            label="Usuário"
            name="userID"
            value={formData.userID}
            onChange={onFormChange}
            displayEmpty
            required
            disabled={loadingUsers}
          >
            <MenuItem value="">
              {loadingUsers ? "Carregando usuários..." : "Selecione o Usuário"}
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} (ID: {user.id})
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            name="typeID"
            value={formData.typeID}
            onChange={onFormChange}
            displayEmpty
            required
          >
            <MenuItem value="">Selecione o Tipo</MenuItem>
            {TRANSACTION_TYPES.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            type="number"
            label="Pontos"
            name="points"
            value={formData.points}
            onChange={onFormChange}
            required
            helperText="Positivo para ganho, negativo para gasto"
          />

          <Select
            fullWidth
            name="payment_method_id"
            value={formData.payment_method_id}
            onChange={onFormChange}
            displayEmpty
            required
          >
            <MenuItem value="">Selecione o Método de Pagamento</MenuItem>
            {PAYMENT_METHODS.map((method) => (
              <MenuItem key={method.id} value={method.id}>
                {method.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            label="Produto (Opcional)"
            name="productID"
            value={formData.productID}
            onChange={onFormChange}
            disabled={isPointsGainedType(formData.typeID) || loadingProducts}
            onOpen={onProductsOpen}
            MenuProps={{
              PaperProps: {
                onScroll: onProductsScroll,
                sx: {
                  maxHeight: "300px",
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#888",
                    borderRadius: "4px",
                  },
                },
              },
            }}
            displayEmpty
          >
            <MenuItem value="">
              {isPointsGainedType(formData.typeID)
                ? "Desabilitado para Pontos Ganhos"
                : loadingProducts
                  ? "Carregando produtos..."
                  : "Selecione um Produto"}
            </MenuItem>
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name} - {product.points.toLocaleString()} pts (
                {product.type_name})
              </MenuItem>
            ))}
            {loadingProducts && (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Carregando
                mais...
              </MenuItem>
            )}
          </Select>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          gap: { xs: 1, sm: 1 },
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "14px" },
            padding: { xs: "8px 12px", sm: "10px 16px" },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "14px" },
            padding: { xs: "8px 12px", sm: "10px 16px" },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
