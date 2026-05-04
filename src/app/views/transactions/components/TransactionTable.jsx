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

export default function TransactionTable({
  transactions,
  loading,
  onEdit,
  onDelete,
}) {
  return (
    <SimpleCard title="Histórico de Transações">
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell align="center">Pontos</TableCell>
              <TableCell align="center">Método de Pagamento</TableCell>
              <TableCell align="center">Data</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Box>
                      <Box sx={{ fontWeight: 600, fontSize: "14px" }}>
                        {transaction.userName}
                      </Box>
                      <Box sx={{ fontSize: "12px", color: "text.secondary" }}>
                        {transaction.userEmail}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ fontSize: "13px" }}>
                      {transaction.type_name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        fontSize: "13px",
                        color: transaction.productID
                          ? "text.primary"
                          : "text.secondary",
                      }}
                    >
                      {transaction.productName}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={transaction.points.toLocaleString()}
                      color={transaction.points > 0 ? "success" : "error"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Chip
                        label={transaction.payment_method_name}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "12px" }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {transaction.created_at}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        gap: { xs: 0.5, sm: 1 },
                        justifyContent: "center",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => onEdit(transaction)}
                        sx={{
                          fontSize: { xs: "10px", sm: "13px" },
                          padding: { xs: "3px 6px", sm: "5px 10px" },
                          minWidth: { xs: "auto", sm: "60px" },
                          whiteSpace: "nowrap",
                          "& .MuiButton-startIcon": {
                            marginRight: { xs: "2px", sm: "4px" },
                          },
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => onDelete(transaction.id)}
                        sx={{
                          fontSize: { xs: "10px", sm: "13px" },
                          padding: { xs: "3px 6px", sm: "5px 10px" },
                          minWidth: { xs: "auto", sm: "60px" },
                          whiteSpace: "nowrap",
                          "& .MuiButton-startIcon": {
                            marginRight: { xs: "2px", sm: "4px" },
                          },
                        }}
                      >
                        Deletar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </SimpleCard>
  );
}
