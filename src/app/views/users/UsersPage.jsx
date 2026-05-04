import { Box, Pagination } from "@mui/material";
import { Breadcrumb } from "app/components";
import { styled } from "@mui/material/styles";
import { useUsers } from "./hooks/useUsers";
import UserFilters from "./components/UserFilters";
import UserStatsRow from "./components/UserStatsRow";
import UserTable from "./components/UserTable";
import UserCards from "./components/UserCards";
import UserDialog from "./components/UserDialog";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  [theme.breakpoints.down("xs")]: { margin: "8px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

export default function UsersPage() {
  const {
    users,
    filters,
    page,
    totalPages,
    openDialog,
    dialogMode,
    formData,
    stats,
    fetching,
    loading,
    handleFilterChange,
    handleClearFilters,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleChangePassword,
    setPage,
  } = useUsers();

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Usuários", path: "/users" },
            { name: "Usuários" },
          ]}
        />
      </Box>

      {/* Statistics */}
      <UserStatsRow stats={stats} />

      {/* Filters */}
      <UserFilters
        filters={filters}
        fetching={fetching}
        onFilterChange={handleFilterChange}
        onOpenDialog={handleOpenDialog}
        onClearFilters={handleClearFilters}
      />

      {/* Desktop Table */}
      <UserTable
        users={users}
        loading={fetching}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangePassword={handleChangePassword}
      />

      {/* Mobile Cards */}
      <UserCards
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangePassword={handleChangePassword}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            disabled={fetching}
            size="medium"
            variant="outlined"
            sx={{
              "& .MuiPagination-ul": {
                flexWrap: "wrap",
                justifyContent: "center",
              },
              "& .MuiPaginationItem-root": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                minWidth: { xs: "24px", sm: "32px" },
                height: { xs: "24px", sm: "32px" },
              },
            }}
          />
        </Box>
      )}

      {/* Dialog for Create/Edit */}
      <UserDialog
        open={openDialog}
        dialogMode={dialogMode}
        formData={formData}
        loading={loading}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={handleCloseDialog}
      />
    </Container>
  );
}
