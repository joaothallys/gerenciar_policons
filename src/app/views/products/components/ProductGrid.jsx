import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StorageIcon from "@mui/icons-material/Storage";

export default function ProductGrid({
  products,
  onEdit,
  onDelete,
  onOpenStock,
}) {
  return (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
              },
            }}
          >
            {product.image_url ? (
              <CardMedia
                component="img"
                height="200"
                image={product.image_url}
                alt={product.name}
              />
            ) : (
              <Box
                sx={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Typography color="textSecondary">Sem Imagem</Typography>
              </Box>
            )}

            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {product.name}
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {product.description}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip
                  label={product.type_name}
                  size="small"
                  color={product.type_id === 1 ? "default" : "primary"}
                  variant="outlined"
                />
                <Chip
                  label={`${product.points.toLocaleString()} pts`}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {product.type_id === 2 && (
                <Typography variant="caption" color="textSecondary">
                  Estoque: {product.stock_quantity || 0} unidades
                </Typography>
              )}
            </CardContent>

            <CardActions sx={{ pt: 0 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => onEdit(product)}
                fullWidth
              >
                Editar
              </Button>
              {product.type_id === 2 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<StorageIcon fontSize="small" />}
                  onClick={() => onOpenStock(product.id)}
                >
                  Estoque
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon fontSize="small" />}
                onClick={() => onDelete(product.id)}
              >
                Deletar
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
