import { Box, Pagination } from "@mui/material";
import { Breadcrumb } from "app/components";
import { useTransactions } from "./hooks/useTransactions";
import TransactionFilters from "./components/TransactionFilters";
import TransactionStatsRow from "./components/TransactionStatsRow";
import TransactionTable from "./components/TransactionTable";
import TransactionCards from "./components/TransactionCards";
import TransactionDialog from "./components/TransactionDialog";
import ExportTransactionsDialog from "./components/ExportTransactionsDialog";
import { styled } from "@mui/material/styles";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  [theme.breakpoints.down("xs")]: { margin: "8px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

export default function TransactionsPage() {
  const {
    // Data
    transactions,
    summary,
    filters,
    page,
    totalPages,
    openDialog,
    editingId,
    formData,

    // Lists
    filterUsers,
    users,
    products,
    productsPage,
    totalProductsPages,

    // Loading states
    fetching,
    loading,
    loadingFilterUsers,
    loadingUsers,
    loadingProducts,
    exportingCsv,

    // Export modal
    openExportDialog,
    setOpenExportDialog,
    handleExportTransactions,

    // Handlers
    handleFilterChange,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    setPage,
    setProductsPage,

    // Helpers
    isPointsGainedType,
    getPointsColor,
  } = useTransactions();

  const handleProductsScroll = (event) => {
    const listboxNode = event.currentTarget;
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) {
      if (productsPage < totalProductsPages && !loadingProducts) {
        setProductsPage((prev) => prev + 1);
      }
    }
  };

  const handleProductsOpen = () => {
    setProducts([]);
    setProductsPage(1);
  };

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Transações", path: "/transactions" },
            { name: "Transações" },
          ]}
        />
      </Box>

      {/* Statistics */}
      <TransactionStatsRow stats={summary} />

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        filterUsers={filterUsers}
        loadingFilterUsers={loadingFilterUsers}
        fetching={fetching}
        onFilterChange={handleFilterChange}
        onOpenDialog={handleOpenDialog}
        onExport={() => setOpenExportDialog(true)}
      />

      {/* Desktop Table */}
      <TransactionTable
        transactions={transactions}
        loading={fetching}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Mobile Cards */}
      <TransactionCards
        transactions={transactions}
        loading={fetching}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
      <TransactionDialog
        open={openDialog}
        editingId={editingId}
        formData={formData}
        users={users}
        products={products}
        loadingUsers={loadingUsers}
        loadingProducts={loadingProducts}
        loading={loading}
        isPointsGainedType={isPointsGainedType}
        totalProductsPages={totalProductsPages}
        productsPage={productsPage}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={handleCloseDialog}
        onProductsScroll={handleProductsScroll}
        onProductsOpen={handleProductsOpen}
        setProductsPage={setProductsPage}
      />

      {/* Export Dialog */}
      <ExportTransactionsDialog
        open={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        filterUsers={filterUsers}
        loadingFilterUsers={loadingFilterUsers}
        onExport={handleExportTransactions}
        isExporting={exportingCsv}
      />
    </Container>
  );
}
