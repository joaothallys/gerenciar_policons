import { Grid } from "@mui/material";
import { StatCard } from "app/components/shared";

export default function TransactionStatsRow({ stats }) {
  return (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="SALDO TOTAL"
          value={stats.totalPoints.toLocaleString()}
          gradient="purple"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="GANHOS"
          value={stats.gainedPoints.toLocaleString()}
          gradient="green"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="GASTOS"
          value={stats.spentPoints.toLocaleString()}
          gradient="red"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="TRANSAÇÕES"
          value={stats.transactionCount}
          gradient="sunset"
        />
      </Grid>
    </Grid>
  );
}
