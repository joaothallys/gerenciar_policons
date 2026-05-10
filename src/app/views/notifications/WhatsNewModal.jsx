import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";

const APP_VERSION = "5.0.7";
const WHATS_NEW_KEY = "whatsNewSeen_v5.0.7";

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWhatsNew = localStorage.getItem(WHATS_NEW_KEY);
    if (!hasSeenWhatsNew) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(WHATS_NEW_KEY, "true");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
        <NotificationsIcon color="primary" />
        Novidades da Versão {APP_VERSION}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <List>
          <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, width: "100%" }}>
              <ListItemIcon sx={{ minWidth: "auto", mt: 0.5 }}>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Busca de Nomes de Usuários
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Melhor integração com o sistema de notificações. Agora exibimos o nome do usuário em vez do ID.
                </Typography>
              </Box>
            </Box>
          </ListItem>

          <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, width: "100%" }}>
              <ListItemIcon sx={{ minWidth: "auto", mt: 0.5 }}>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Centro de Notificações Aprimorado
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Gerencie notificações com mais precisão e eficiência.
                </Typography>
              </Box>
            </Box>
          </ListItem>

          <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, width: "100%" }}>
              <ListItemIcon sx={{ minWidth: "auto", mt: 0.5 }}>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Tela de Metas Melhorada
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Novo filtro por mês, visualização de progresso com barra colorida, e gerenciamento simplificado de metas.
                </Typography>
              </Box>
            </Box>
          </ListItem>

        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="contained" color="primary">
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
