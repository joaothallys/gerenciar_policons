import { Box, Card, Button, Chip, Grid, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const MobileCardsContainer = styled(Box)(({ theme }) => ({
  display: "none",
  [theme.breakpoints.down("md")]: {
    display: "block",
  },
}));

const TransactionCard = styled(Card)(({ theme }) => ({
  padding: "16px",
  marginBottom: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  borderRadius: "12px",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transform: "translateY(-2px)",
  },
}));

export default function TransactionCards({
  transactions,
  loading,
  onEdit,
  onDelete,
}) {
  return (
    <MobileCardsContainer>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : transactions.length > 0 ? (
        transactions.map((transaction) => (
          <TransactionCard key={transaction.id}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    fontWeight: 700,
                    fontSize: "15px",
                    mb: 0.5,
                    color: "#1a1a1a",
                  }}
                >
                  {transaction.userName}
                </Box>
                <Box sx={{ fontSize: "12px", color: "text.secondary" }}>
                  {transaction.userEmail}
                </Box>
              </Box>
              <Chip
                label={transaction.points.toLocaleString()}
                color={transaction.points > 0 ? "success" : "error"}
                size="medium"
                sx={{ fontWeight: 700, fontSize: "14px" }}
              />
            </Box>

            {/* Type */}
            <Box sx={{ mb: 1.5, pb: 1.5, borderBottom: "1px solid #f0f0f0" }}>
              <Box
                sx={{
                  fontSize: "11px",
                  color: "text.secondary",
                  mb: 0.5,
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Tipo de Transação
              </Box>
              <Box sx={{ fontSize: "13px", fontWeight: 500 }}>
                {transaction.type_name}
              </Box>
            </Box>

            {/* Info Grid */}
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    fontSize: "11px",
                    color: "text.secondary",
                    mb: 0.5,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Produto
                </Box>
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
                  Pagamento
                </Box>
                <Chip
                  label={transaction.payment_method_name}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "11px", height: "24px" }}
                />
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
                  Data
                </Box>
                <Box sx={{ fontSize: "13px" }}>
                  {transaction.created_at}
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                pt: 1.5,
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => onEdit(transaction)}
                sx={{ fontSize: "12px", py: 0.8 }}
              >
                Editar
              </Button>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon fontSize="small" />}
                onClick={() => onDelete(transaction.id)}
                sx={{ fontSize: "12px", py: 0.8 }}
              >
                Deletar
              </Button>
            </Box>
          </TransactionCard>
        ))
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            color: "text.secondary",
          }}
        >
          Nenhuma transação encontrada
        </Box>
      )}
    </MobileCardsContainer>
  );
}
