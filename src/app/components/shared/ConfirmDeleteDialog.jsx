import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { Box } from "@mui/material";

export default function ConfirmDeleteDialog({
  open = false,
  title = "Confirmação de exclusão",
  message = "Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita.",
  onConfirm,
  onCancel,
  loading = false,
  sx,
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth sx={sx}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} alignItems="flex-start">
          <WarningIcon color="error" sx={{ mt: 1, flexShrink: 0 }} />
          <Typography variant="body2" color="textSecondary">
            {message}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? "Deletando..." : "Deletar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
