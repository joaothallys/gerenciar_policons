import { Grid, TextField, Select, MenuItem, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { FilterSection } from "app/components/shared";

export default function TransactionFilters({
  filters,
  filterUsers,
  loadingFilterUsers,
  fetching,
  onFilterChange,
  onOpenDialog,
  onExport,
}) {
  return (
    <FilterSection>
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            placeholder="Nome, tipo, produto..."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Select
            fullWidth
            size="small"
            name="userId"
            value={filters.userId}
            onChange={onFilterChange}
            displayEmpty
            disabled={loadingFilterUsers}
          >
            <MenuItem value="">
              {loadingFilterUsers ? "Carregando..." : "Todos os Usuários"}
            </MenuItem>
            {filterUsers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Data Início"
            name="startDate"
            value={filters.startDate}
            onChange={onFilterChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Data Fim"
            name="endDate"
            value={filters.endDate}
            onChange={onFilterChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            disabled={fetching}
            sx={{
              fontSize: { xs: "12px", sm: "14px" },
              padding: { xs: "8px 12px", sm: "10px 16px" },
            }}
          >
            Exportar Excel
          </Button>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onOpenDialog}
            sx={{
              fontSize: { xs: "12px", sm: "14px" },
              padding: { xs: "8px 12px", sm: "10px 16px" },
            }}
          >
            Nova Transação
          </Button>
        </Grid>
      </Grid>
    </FilterSection>
  );
}
