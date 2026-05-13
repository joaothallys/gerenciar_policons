// Transaction Types - Business Rules: 1-3,9-10 gains, 4-6 losses, 7-8 spent
export const TRANSACTION_TYPES = [
  { id: 1, name: "Pontos Ganhos - Meta" },
  { id: 2, name: "Pontos Ganhos - Trimestral" },
  { id: 3, name: "Pontos Ganhos - Jogos" },
  { id: 4, name: "Pontos Perdidos - Frequência" },
  { id: 5, name: "Pontos Perdidos - Organização" },
  { id: 6, name: "Pontos Perdidos - Trimestral" },
  { id: 7, name: "Pontos Gastos - Loja Virtual" },
  { id: 8, name: "Pontos Gastos - Loja Física" },
  { id: 9, name: "Pontos Ganhos - Cursos" },
  { id: 10, name: "Pontos Ganhos - Academia" },
];

export const PAYMENT_METHODS = [
  { id: 2, name: "Policoins" },
  { id: 1, name: "Desconto em folha" },
];

export const PRODUCT_TYPES = [
  { id: 1, name: "Virtual" },
  { id: 2, name: "Físico" },
];

export const PRODUCT_DESCRIPTION_OPTIONS = [
  "Bebidas",
  "Eletrônicos",
  "Eletrodomésticos",
  "Esportivos",
  "Mini Mercado",
  "Perfumaria & Beleza",
  "Variedades & Utensílios",
  "Vouchers",
];

export const USER_ROLES = [
  { id: 1, name: "Usuário" },
  { id: 2, name: "Admin" },
];

// Business logic helpers for transaction types
export const isGainType = (typeId) => [1, 2, 3, 9, 10].includes(Number(typeId));
export const isLostType = (typeId) => [4, 5, 6].includes(Number(typeId));
export const isSpentType = (typeId) => [7, 8].includes(Number(typeId));

// Get transaction type name by ID
export const getTransactionTypeName = (typeId) => {
  const type = TRANSACTION_TYPES.find((t) => t.id === Number(typeId));
  return type ? type.name : "Desconhecido";
};

// Get product type name by ID
export const getProductTypeName = (typeId) => {
  const type = PRODUCT_TYPES.find((t) => t.id === Number(typeId));
  return type ? type.name : "Desconhecido";
};

// Get role name by ID
export const getRoleName = (roleId) => {
  const role = USER_ROLES.find((r) => r.id === Number(roleId));
  return role ? role.name : "Desconhecido";
};
