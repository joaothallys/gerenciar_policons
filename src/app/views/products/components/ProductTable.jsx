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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StorageIcon from "@mui/icons-material/Storage";
import { SimpleCard } from "app/components";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginBottom: "30px",
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
    },
  },
}));

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onOpenStock,
}) {
  if (products.length === 0) {
    return (
      <SimpleCard title="Produtos">
        <Box textAlign="center" py={5} color="text.secondary">
          Nenhum produto encontrado
        </Box>
      </SimpleCard>
    );
  }

  return (
    <SimpleCard title="Produtos">
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="center">Tipo</TableCell>
              <TableCell align="center">Pontos</TableCell>
              <TableCell align="center">Estoque</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                <TableCell sx={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {product.description}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={product.type_name}
                    size="small"
                    color={product.type_id === 1 ? "default" : "primary"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">{product.points.toLocaleString()}</TableCell>
                <TableCell align="center">
                  {product.type_id === 2 ? (
                    <Box sx={{ fontWeight: 500 }}>
                      {product.stock_quantity || 0} unid.
                    </Box>
                  ) : (
                    <Box color="textSecondary">—</Box>
                  )}
                </TableCell>
                <TableCell align="center" sx={{ minWidth: "280px" }}>
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", flexWrap: "wrap" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon fontSize="small" />}
                      onClick={() => onEdit(product)}
                      sx={{ flex: "1 1 auto", minWidth: "70px", fontSize: "12px", whiteSpace: "nowrap" }}
                    >
                      Editar
                    </Button>
                    {product.type_id === 2 && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        startIcon={<StorageIcon fontSize="small" />}
                        onClick={() => onOpenStock(product.id)}
                        sx={{ flex: "1 1 auto", minWidth: "70px", fontSize: "12px", whiteSpace: "nowrap" }}
                      >
                        Estoque
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => onDelete(product.id)}
                      sx={{ flex: "1 1 auto", minWidth: "70px", fontSize: "12px", whiteSpace: "nowrap" }}
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
