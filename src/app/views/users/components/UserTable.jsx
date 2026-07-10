import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import RestoreIcon from "@mui/icons-material/Restore";
import { SimpleCard } from "app/components";

const ActionButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "colorvariant",
})(({ theme, colorvariant = "default" }) => {
  const colors = {
    default: {
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.light}`,
      hover: theme.palette.primary.light + "33",
    },
    warning: {
      color: theme.palette.warning.main,
      border: `1px solid ${theme.palette.warning.light}`,
      hover: theme.palette.warning.light + "33",
    },
    error: {
      color: theme.palette.error.main,
      border: `1px solid ${theme.palette.error.light}`,
      hover: theme.palette.error.light + "33",
    },
    success: {
      color: theme.palette.success.main,
      border: `1px solid ${theme.palette.success.light}`,
      hover: theme.palette.success.light + "33",
    },
  };

  const variant = colors[colorvariant] || colors.default;

  return {
    width: 32,
    height: 32,
    borderRadius: "8px",
    color: variant.color,
    border: variant.border,
    backgroundColor: "#fff",
    "&:hover": {
      backgroundColor: variant.hover,
    },
  };
});

const ActionsGroup = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  flexWrap: "nowrap",
  whiteSpace: "nowrap",
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginBottom: "30px",
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
  "& .MuiTableHead-root": {
    "& .MuiTableCell-head": {
      backgroundColor: "#f5f5f5",
      fontWeight: 600,
      color: "#1a1a1a",
      borderBottom: "2px solid #e0e0e0",
      fontSize: "14px",
    },
  },
  "& .MuiTableBody-root": {
    "& .MuiTableRow-root": {
      "&:hover": {
        backgroundColor: "#fafafa",
      },
      "& .MuiTableCell-body": {
        fontSize: "14px",
      },
    },
  },
}));

export default function UserTable({
  users,
  viewMode = "active",
  loading,
  onEdit,
  onDelete,
  onChangePassword,
  onRestore,
}) {
  const isDeletedView = viewMode === "deleted";
  const cardTitle = isDeletedView ? "Usuários Deletados" : "Usuários Ativos";
  const emptyMessage = isDeletedView
    ? "Nenhum usuário deletado encontrado"
    : "Nenhum usuário encontrado";

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <SimpleCard title={cardTitle}>
        <Box textAlign="center" py={5} color="text.secondary">
          {emptyMessage}
        </Box>
      </SimpleCard>
    );
  }

  return (
    <SimpleCard title={cardTitle}>
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Papel</TableCell>
              <TableCell align="center">Pontos Elegíveis</TableCell>
              <TableCell align="center">Pontos Totais</TableCell>
              <TableCell align="center">
                {isDeletedView ? "Data Exclusão" : "Data Criação"}
              </TableCell>
              <TableCell align="center" sx={{ width: 130 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                sx={isDeletedView ? { backgroundColor: "rgba(0,0,0,0.02)" } : undefined}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ fontWeight: 600, fontSize: "14px" }}>
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
                </TableCell>
                <TableCell sx={{ fontSize: "13px" }}>
                  {user.email}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={user.role_name}
                    color={user.role_id === 2 ? "error" : "default"}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ fontSize: "14px", fontWeight: 500 }}>
                    {user.points_eligible.toLocaleString("pt-BR")}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ fontSize: "14px", fontWeight: 500 }}>
                    {user.points_sum.toLocaleString("pt-BR")}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontSize: "13px" }}>
                  {isDeletedView ? user.deleted_at : user.created_at}
                </TableCell>
                <TableCell align="center" sx={{ py: 1 }}>
                  <ActionsGroup>
                    {isDeletedView ? (
                      <Tooltip title="Restaurar" arrow>
                        <ActionButton
                          colorvariant="success"
                          size="small"
                          onClick={() => onRestore(user.id)}
                          aria-label="Restaurar usuário"
                        >
                          <RestoreIcon sx={{ fontSize: 17 }} />
                        </ActionButton>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip title="Editar" arrow>
                          <ActionButton
                            size="small"
                            onClick={() => onEdit(user)}
                            aria-label="Editar usuário"
                          >
                            <EditIcon sx={{ fontSize: 17 }} />
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Alterar senha" arrow>
                          <ActionButton
                            colorvariant="warning"
                            size="small"
                            onClick={() => onChangePassword(user)}
                            aria-label="Alterar senha"
                          >
                            <LockIcon sx={{ fontSize: 17 }} />
                          </ActionButton>
                        </Tooltip>
                        <Tooltip title="Deletar" arrow>
                          <ActionButton
                            colorvariant="error"
                            size="small"
                            onClick={() => onDelete(user.id)}
                            aria-label="Deletar usuário"
                          >
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </ActionButton>
                        </Tooltip>
                      </>
                    )}
                  </ActionsGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </SimpleCard>
  );
}
