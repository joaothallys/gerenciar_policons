import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function PasswordField({ label, name, value, onChange, error, helperText, autoFocus }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText}
      autoFocus={autoFocus}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "ocultar senha" : "mostrar senha"}
              onClick={() => setShowPassword((prev) => !prev)}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

export default function UserPasswordDialog({
  open,
  user,
  formData,
  formErrors,
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
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: "warning.light",
              color: "warning.dark",
            }}
          >
            <LockIcon fontSize="small" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: { xs: "18px", sm: "20px" }, fontWeight: 600 }}>
              Alterar Senha
            </Typography>
            {user && (
              <Typography variant="body2" color="text.secondary">
                {user.username} · {user.email}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, px: { xs: 2, sm: 3 } }}>
        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <PasswordField
            label="Senha atual"
            name="old_password"
            value={formData.old_password}
            onChange={onFormChange}
            error={formErrors.old_password}
            helperText="Informe a senha atual do usuário"
            autoFocus
          />

          <PasswordField
            label="Nova senha"
            name="new_password"
            value={formData.new_password}
            onChange={onFormChange}
            error={formErrors.new_password}
            helperText="Mínimo 6 caracteres"
          />

          <PasswordField
            label="Confirmar nova senha"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={onFormChange}
            error={formErrors.confirm_password}
            helperText="Repita a nova senha"
          />
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
          disabled={loading}
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
          color="warning"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "14px" },
            padding: { xs: "8px 12px", sm: "10px 16px" },
          }}
        >
          {loading ? "Salvando..." : "Alterar Senha"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
