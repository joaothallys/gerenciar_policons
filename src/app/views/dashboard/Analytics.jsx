import { Box, Typography, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  backgroundColor: theme.palette.background.paper,
}));

export default function Analytics() {
  return (
    <Box sx={{ padding: 3 }}>
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom color="primary">
          Dashboard de Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
          Bem-vindo à página de analytics. Esta seção está sendo preparada para exibir
          métricas e insights importantes sobre o sistema.
        </Typography>
      </StyledPaper>
    </Box>
  );
}
