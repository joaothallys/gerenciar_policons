import { Box, Pagination } from "@mui/material";
import { Breadcrumb } from "app/components";
import { ConfirmDeleteDialog } from "app/components/shared";
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
    viewMode,
    page,
    totalPages,
    openDialog,
    dialogMode,
    formData,
    userToDelete,
    stats,
    fetching,
    loading,
    handleFilterChange,
    handleViewModeChange,
    handleClearFilters,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleSubmit,
    handleEdit,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
    handleRestore,
    handleChangePassword,
    setPage,
  } = useUsers();

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Usuários", path: "/users" },
            { name: viewMode === "deleted" ? "Deletados" : "Ativos" },
          ]}
        />
      </Box>

      <UserStatsRow stats={stats} viewMode={viewMode} />

      <UserFilters
        filters={filters}
        viewMode={viewMode}
        fetching={fetching}
        onFilterChange={handleFilterChange}
        onViewModeChange={handleViewModeChange}
        onOpenDialog={handleOpenDialog}
        onClearFilters={handleClearFilters}
      />

      <UserTable
        users={users}
        viewMode={viewMode}
        loading={fetching}
        onEdit={handleEdit}
        onDelete={handleRequestDelete}
        onChangePassword={handleChangePassword}
        onRestore={handleRestore}
      />

      <UserCards
        users={users}
        viewMode={viewMode}
        onEdit={handleEdit}
        onDelete={handleRequestDelete}
        onChangePassword={handleChangePassword}
        onRestore={handleRestore}
      />

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

      <UserDialog
        open={openDialog}
        dialogMode={dialogMode}
        formData={formData}
        loading={loading}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={handleCloseDialog}
      />

      <ConfirmDeleteDialog
        open={!!userToDelete}
        title="Confirmar exclusão de usuário"
        message={
          userToDelete
            ? `Tem certeza que deseja deletar o usuário "${userToDelete.username}" (${userToDelete.email})? O usuário poderá ser restaurado posteriormente na aba Deletados.`
            : ""
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={loading}
      />
    </Container>
  );
}
