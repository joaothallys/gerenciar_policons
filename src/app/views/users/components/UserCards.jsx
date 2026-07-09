import { Box, Card, Button, Chip, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import RestoreIcon from "@mui/icons-material/Restore";

const MobileCardsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("md")]: {
    display: "block",
  },
}));

const UserCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "isDeleted",
})(({ theme, isDeleted }) => ({
  padding: "16px",
  marginBottom: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  borderRadius: "12px",
  transition: "all 0.3s ease",
  ...(isDeleted && {
    backgroundColor: "rgba(0,0,0,0.02)",
    border: "1px dashed #e0e0e0",
  }),
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
  },
}));

export default function UserCards({
  users,
  viewMode = "active",
  onEdit,
  onDelete,
  onChangePassword,
  onRestore,
}) {
  const isDeletedView = viewMode === "deleted";
  const emptyMessage = isDeletedView
    ? "Nenhum usuário deletado encontrado"
    : "Nenhum usuário encontrado";

  if (users.length === 0) {
    return (
      <MobileCardsContainer>
        <Box textAlign="center" py={5} color="text.secondary">
          {emptyMessage}
        </Box>
      </MobileCardsContainer>
    );
  }

  return (
    <MobileCardsContainer>
      {users.map((user) => (
        <UserCard key={user.id} isDeleted={isDeletedView}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Box sx={{ fontWeight: 700, fontSize: "15px" }}>
                  {user.username}
                </Box>
                {isDeletedView && (
                  <Chip
                    label="Deletado"
                    color="default"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <Box sx={{ fontSize: "12px", color: "text.secondary" }}>
                {user.email}
              </Box>
            </Box>
            <Chip
              label={user.role_name}
              color={user.role_id === 2 ? "error" : "default"}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={6}>
              <Box
                sx={{
                  fontSize: "11px",
                  color: "text.secondary",
                  mb: 0.5,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Pontos
              </Box>
              <Box sx={{ fontSize: "16px", fontWeight: 600 }}>
                {user.points_sum.toLocaleString()}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  fontSize: "11px",
                  color: "text.secondary",
                  mb: 0.5,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {isDeletedView ? "Data Exclusão" : "Data Criação"}
              </Box>
              <Box sx={{ fontSize: "13px" }}>
                {isDeletedView ? user.deleted_at : user.created_at}
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              pt: 1.5,
              flexDirection: "column",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            {isDeletedView ? (
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="success"
                startIcon={<RestoreIcon fontSize="small" />}
                onClick={() => onRestore(user.id)}
                sx={{ fontSize: "12px", py: 0.8 }}
              >
                Restaurar
              </Button>
            ) : (
              <>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon fontSize="small" />}
                  onClick={() => onEdit(user)}
                  sx={{ fontSize: "12px", py: 0.8 }}
                >
                  Editar
                </Button>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={<LockIcon fontSize="small" />}
                    onClick={() => onChangePassword(user)}
                    sx={{ fontSize: "12px", py: 0.8 }}
                  >
                    Senha
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon fontSize="small" />}
                    onClick={() => onDelete(user.id)}
                    sx={{ fontSize: "12px", py: 0.8 }}
                  >
                    Deletar
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </UserCard>
      ))}
    </MobileCardsContainer>
  );
}
