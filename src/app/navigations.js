const navigations = [
  { label: "Ferramentas", type: "label" },
  {
    name: "Ferramentas",
    icon: "favorite",
    badge: { value: "5+", color: "secondary" },
    children: [
      { name: "Transações", path: "/transactions", iconText: "T" },
      { name: "Produtos", path: "/products", iconText: "P" },
      { name: "Importar Policoins", path: "/import", iconText: "I" },
      { name: "Usuários", path: "/users", iconText: "U" },
      { name: "Metas Mensais", path: "/metas", iconText: "M" },
    ]
  },
];

export default navigations;
