import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import { SimpleCard } from "app/components";

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
  loading,
  onEdit,
  onDelete,
  onChangePassword,
}) {
  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <SimpleCard title="Usuários">
        <Box textAlign="center" py={5} color="text.secondary">
          Nenhum usuário encontrado
        </Box>
      </SimpleCard>
    );
  }

  return (
    <SimpleCard title="Usuários">
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Papel</TableCell>
              <TableCell align="center">Pontos Totais</TableCell>
              <TableCell align="center">Data Criação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ fontWeight: 600, fontSize: "14px" }}>
                    {user.username}
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
                    {user.points_sum.toLocaleString()}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontSize: "13px" }}>
                  {user.created_at}
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      gap: { xs: 0.5, sm: 1 },
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon fontSize="small" />}
                      onClick={() => onEdit(user)}
                      sx={{
                        fontSize: { xs: "10px", sm: "12px" },
                        padding: { xs: "3px 6px", sm: "5px 8px" },
                        minWidth: "auto",
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<LockIcon fontSize="small" />}
                      onClick={() => onChangePassword(user.id)}
                      sx={{
                        fontSize: { xs: "10px", sm: "12px" },
                        padding: { xs: "3px 6px", sm: "5px 8px" },
                        minWidth: "auto",
                      }}
                    >
                      Senha
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => onDelete(user.id)}
                      sx={{
                        fontSize: { xs: "10px", sm: "12px" },
                        padding: { xs: "3px 6px", sm: "5px 8px" },
                        minWidth: "auto",
                      }}
                    >
                      Deletar
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </SimpleCard>
  );
}
