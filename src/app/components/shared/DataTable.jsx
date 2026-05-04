import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

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
      "& .MuiTableCell-body": {
        fontSize: "14px",
      },
    },
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "12px",
    "& .MuiTableCell-root": {
      padding: "8px 4px",
    },
  },
}));

export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = "Nenhum dado encontrado",
  sx,
}) {
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="body2" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <StyledTableContainer sx={sx}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field} align={column.align || "left"}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column.field}`} align={column.align || "left"}>
                  {column.render
                    ? column.render(row[column.field], row, rowIndex)
                    : row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
}
