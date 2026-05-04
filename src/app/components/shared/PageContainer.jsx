import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Breadcrumb } from "app/components";

const StyledContainer = styled(Box)(({ theme }) => ({
  margin: "30px",
  maxWidth: "100%",
  [theme.breakpoints.down("sm")]: {
    margin: "16px",
  },
  [theme.breakpoints.down("xs")]: {
    margin: "8px",
  },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: {
      marginBottom: "16px",
    },
  },
}));

export default function PageContainer({ title, path, children, sx }) {
  return (
    <StyledContainer sx={sx}>
      <Breadcrumb
        routeSegments={path}
        sx={{ marginBottom: "30px", ...sx?.breadcrumb }}
      />
      {children}
    </StyledContainer>
  );
}
