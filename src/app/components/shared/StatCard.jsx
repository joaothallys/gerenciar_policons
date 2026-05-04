import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledStatCard = styled(Paper)(({ theme, $gradient }) => {
  const gradients = {
    purple: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    green: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    red: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  };

  return {
    padding: "20px",
    textAlign: "center",
    borderRadius: "8px",
    background: gradients[$gradient || "purple"],
    color: "white",
    "& .stat-value": {
      fontSize: "28px",
      fontWeight: 700,
      marginTop: "10px",
    },
    "& .stat-label": {
      fontSize: "12px",
      fontWeight: 500,
      opacity: 0.9,
      marginTop: "5px",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "16px",
      "& .stat-value": {
        fontSize: "20px",
        marginTop: "8px",
      },
      "& .stat-label": {
        fontSize: "11px",
        marginTop: "4px",
      },
    },
    [theme.breakpoints.down("xs")]: {
      padding: "12px",
      "& .stat-value": {
        fontSize: "18px",
        marginTop: "6px",
      },
      "& .stat-label": {
        fontSize: "10px",
        marginTop: "3px",
      },
    },
  };
});

export default function StatCard({ label, value, gradient = "purple", sx }) {
  return (
    <StyledStatCard $gradient={gradient} sx={sx}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </StyledStatCard>
  );
}
