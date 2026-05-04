import { Grid } from "@mui/material";
import { StatCard } from "app/components/shared";

export default function ProductStatsRow({ stats }) {
  return (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="TOTAL DE PRODUTOS"
          value={stats.total}
          gradient="purple"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="PRODUTOS VIRTUAIS"
          value={stats.virtual}
          gradient="green"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="PRODUTOS FÍSICOS"
          value={stats.physical}
          gradient="red"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="TOTAL DE PONTOS"
          value={stats.totalPoints.toLocaleString()}
          gradient="sunset"
        />
      </Grid>
    </Grid>
  );
}
