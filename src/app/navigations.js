const navigations = [
  { label: "Ferramentas", type: "label" },
  {
    name: "Ferramentas",
    icon: "favorite",
    badge: { value: "6+", color: "secondary" },
    children: [
      { name: "Transações", path: "/transactions", iconText: "T" },
      { name: "Produtos", path: "/products", iconText: "P" },
      { name: "Importar Policoins", path: "/import", iconText: "I" },
      { name: "Usuários", path: "/users", iconText: "U" },
      { name: "Metas Mensais", path: "/metas", iconText: "M" },
      { name: "Notificações", path: "/notifications", iconText: "N" },
    ]
  },
];

export default navigations;
