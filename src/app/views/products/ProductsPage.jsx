import { Box, Pagination } from "@mui/material";
import { Breadcrumb } from "app/components";
import { styled } from "@mui/material/styles";
import { useProducts } from "./hooks/useProducts";
import ProductFilters from "./components/ProductFilters";
import ProductStatsRow from "./components/ProductStatsRow";
import ProductGrid from "./components/ProductGrid";
import ProductTable from "./components/ProductTable";
import ProductDialog from "./components/ProductDialog";
import StockDialog from "./components/StockDialog";

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  [theme.breakpoints.down("xs")]: { margin: "8px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

export default function ProductsPage() {
  const {
    products,
    filters,
    page,
    totalPages,
    viewMode,
    openDialog,
    dialogMode,
    formData,
    stats,
    stockDialogOpen,
    stockQuantity,
    fetching,
    loading,
    handleFilterChange,
    handleClearFilters,
    handleViewModeChange,
    handleOpenDialog,
    handleCloseDialog,
    handleFormChange,
    handleImageChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleOpenStockDialog,
    handleCloseStockDialog,
    handleUpdateStock,
    setPage,
    setStockQuantity,
  } = useProducts();

  return (
    <Container>
      {/* Breadcrumb */}
      <Box className="breadcrumb">
        <Breadcrumb
          routeSegments={[
            { name: "Produtos", path: "/products" },
            { name: "Produtos" },
          ]}
        />
      </Box>

      {/* Statistics */}
      <ProductStatsRow stats={stats} />

      {/* Filters */}
      <ProductFilters
        filters={filters}
        viewMode={viewMode}
        fetching={fetching}
        onFilterChange={handleFilterChange}
        onViewModeChange={handleViewModeChange}
        onOpenDialog={handleOpenDialog}
        onClearFilters={handleClearFilters}
      />

      {/* Grid View */}
      {viewMode === "grid" ? (
        <>
          <ProductGrid
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenStock={handleOpenStockDialog}
          />

          {/* Pagination for Grid */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                disabled={fetching}
                size="medium"
                variant="outlined"
              />
            </Box>
          )}
        </>
      ) : (
        <>
          {/* Table View */}
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenStock={handleOpenStockDialog}
          />

          {/* Pagination for Table */}
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
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog for Create/Edit */}
      <ProductDialog
        open={openDialog}
        dialogMode={dialogMode}
        formData={formData}
        loading={loading}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        onClose={handleCloseDialog}
      />

      {/* Stock Dialog */}
      <StockDialog
        open={stockDialogOpen}
        stockQuantity={stockQuantity}
        loading={loading}
        onQuantityChange={(e) => setStockQuantity(e.target.value)}
        onSubmit={handleUpdateStock}
        onClose={handleCloseStockDialog}
      />
    </Container>
  );
}
