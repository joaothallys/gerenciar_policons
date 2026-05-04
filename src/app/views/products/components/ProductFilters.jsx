import { Grid, TextField, Select, MenuItem, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import { FilterSection } from "app/components/shared";
import { PRODUCT_TYPES } from "app/constants";

export default function ProductFilters({
  filters,
  viewMode,
  fetching,
  onFilterChange,
  onViewModeChange,
  onOpenDialog,
  onClearFilters,
}) {
  return (
    <FilterSection>
      <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-end">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            name="search"
            value={filters.search}
            onChange={onFilterChange}
            placeholder="Nome ou descrição..."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Select
            fullWidth
            size="small"
            name="typeFilter"
            value={filters.typeFilter}
            onChange={onFilterChange}
            displayEmpty
            disabled={fetching}
          >
            <MenuItem value="">Todos os Tipos</MenuItem>
            {PRODUCT_TYPES.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            disabled={fetching || (!filters.search && !filters.typeFilter)}
            sx={{
              fontSize: { xs: "12px", sm: "14px" },
              padding: { xs: "8px 12px", sm: "10px 16px" },
            }}
          >
            Limpar
          </Button>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode !== null) {
                onViewModeChange(newMode);
              }
            }}
            fullWidth
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewWeekIcon />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <ViewAgendaIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => onOpenDialog("create")}
            sx={{
              fontSize: { xs: "12px", sm: "14px" },
              padding: { xs: "8px 12px", sm: "10px 16px" },
            }}
          >
            Novo Produto
          </Button>
        </Grid>
      </Grid>
    </FilterSection>
  );
}
