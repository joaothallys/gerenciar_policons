import {
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import PersonIcon from "@mui/icons-material/Person";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { FilterSection } from "app/components/shared";
import { USER_ROLES } from "app/constants";

export default function UserFilters({
  filters,
  viewMode,
  fetching,
  onFilterChange,
  onViewModeChange,
  onOpenDialog,
  onClearFilters,
}) {
  const isDeletedView = viewMode === "deleted";

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
            placeholder="Email ou username..."
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Select
            fullWidth
            size="small"
            name="roleFilter"
            value={filters.roleFilter}
            onChange={onFilterChange}
            displayEmpty
            disabled={fetching}
          >
            <MenuItem value="">Todos os Papéis</MenuItem>
            {USER_ROLES.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => onViewModeChange(newMode)}
            fullWidth
            size="small"
            color="primary"
          >
            <ToggleButton value="active" aria-label="usuários ativos">
              <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
              Ativos
            </ToggleButton>
            <ToggleButton value="deleted" aria-label="usuários deletados">
              <DeleteOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
              Deletados
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            disabled={fetching || (!filters.search && !filters.roleFilter)}
            sx={{
              fontSize: { xs: "12px", sm: "14px" },
              padding: { xs: "8px 12px", sm: "10px 16px" },
            }}
          >
            Limpar
          </Button>
        </Grid>

        {!isDeletedView && (
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
              Novo Usuário
            </Button>
          </Grid>
        )}
      </Grid>
    </FilterSection>
  );
}
