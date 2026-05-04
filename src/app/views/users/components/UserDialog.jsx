import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { USER_ROLES } from "app/constants";

export default function UserDialog({
  open,
  dialogMode,
  formData,
  loading,
  onFormChange,
  onSubmit,
  onClose,
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
        {dialogMode === "create" ? "Novo Usuário" : "Editar Usuário"}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onFormChange}
            required
            autoFocus
          />

          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={onFormChange}
            required
          />

          <TextField
            fullWidth
            label={dialogMode === "create" ? "Senha *" : "Senha (deixar vazio para manter)"}
            name="password"
            type="password"
            value={formData.password}
            onChange={onFormChange}
            required={dialogMode === "create"}
          />

          <Select
            fullWidth
            name="role_id"
            value={formData.role_id}
            onChange={onFormChange}
          >
            {USER_ROLES.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
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
