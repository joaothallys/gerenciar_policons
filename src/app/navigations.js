const navigations = [
  { name: "Dashboard", path: "/dashboard/default", icon: "dashboard" },
  { label: "Ferramentas", type: "label" },
  {
    name: "Ferramentas",
    icon: "favorite",
    badge: { value: "5+", color: "secondary" },
    children: [
      { name: "Transações", path: "/material/customer", iconText: "T" },
      { name: "Produtos", path: "/material/products", iconText: "P" },
      { name: "Importar Policoins", path: "/material/import", iconText: "I" },
      { name: "Usuários", path: "/material/manage", iconText: "U" },
      { name: "Metas Mensais", path: "/material/metas", iconText: "M" },
      //{ name: "Progress", path: "/material/progress", iconText: "P" },
      //{ name: "Radio", path: "/material/radio", iconText: "R" },
      //{ name: "Switch", path: "/material/switch", iconText: "S" },
      //{ name: "Slider", path: "/material/slider", iconText: "S" },
      //{ name: "Table", path: "/material/table", iconText: "T" }
    ]
  },
];

export default navigations;
