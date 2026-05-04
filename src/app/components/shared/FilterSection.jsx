import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledFilterCard = styled(Card)(({ theme }) => ({
  padding: "20px",
  marginBottom: "30px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: "16px",
    marginBottom: "20px",
  },
  [theme.breakpoints.down("xs")]: {
    padding: "12px",
    marginBottom: "16px",
  },
}));

export default function FilterSection({ children, sx }) {
  return <StyledFilterCard sx={sx}>{children}</StyledFilterCard>;
}
