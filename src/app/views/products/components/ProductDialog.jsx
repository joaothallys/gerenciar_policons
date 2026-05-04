import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { PRODUCT_TYPES, PRODUCT_DESCRIPTION_OPTIONS } from "app/constants";

export default function ProductDialog({
  open,
  dialogMode,
  formData,
  loading,
  onFormChange,
  onImageChange,
  onSubmit,
  onClose,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          margin: { xs: 1, sm: 2 },
        },
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: "18px", sm: "20px" } }}>
        {dialogMode === "create" ? "Novo Produto" : "Editar Produto"}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
        <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Nome *"
            name="name"
            value={formData.name}
            onChange={onFormChange}
            required
            autoFocus
          />

          <Select
            fullWidth
            name="description"
            value={formData.description}
            onChange={onFormChange}
            displayEmpty
          >
            <MenuItem value="">Selecione a Categoria</MenuItem>
            {PRODUCT_DESCRIPTION_OPTIONS.map((desc) => (
              <MenuItem key={desc} value={desc}>
                {desc}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            label="Pontos *"
            name="points"
            type="number"
            value={formData.points}
            onChange={onFormChange}
            required
            inputProps={{ min: "1" }}
          />

          <Select
            fullWidth
            name="type_id"
            value={formData.type_id}
            onChange={onFormChange}
          >
            {PRODUCT_TYPES.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>

          {/* Image Upload */}
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Fazer upload de imagem (PNG, max 5MB)
              <input
                hidden
                accept=".png,image/png"
                type="file"
                onChange={onImageChange}
              />
            </Button>

            {formData.imagePreview && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            )}

            <Alert severity="info" sx={{ fontSize: "12px" }}>
              Apenas imagens PNG são aceitas. Tamanho máximo: 5MB
            </Alert>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          gap: { xs: 1, sm: 1 },
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "14px" },
            padding: { xs: "8px 12px", sm: "10px 16px" },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            width: { xs: "100%", sm: "auto" },
            fontSize: { xs: "12px", sm: "14px" },
            padding: { xs: "8px 12px", sm: "10px 16px" },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
