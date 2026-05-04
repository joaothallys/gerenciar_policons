import { lazy } from "react";
import Loadable from "app/components/Loadable";

const TransactionsPage = Loadable(lazy(() => import("app/views/transactions/TransactionsPage")));
const UsersPage = Loadable(lazy(() => import("app/views/users/UsersPage")));
const ProductsPage = Loadable(lazy(() => import("app/views/products/ProductsPage")));
const ImportPage = Loadable(lazy(() => import("app/views/import/ImportPage")));
const MetasPage = Loadable(lazy(() => import("app/views/metas/MetasPage")));

const materialRoutes = [
  { path: "/transactions", element: <TransactionsPage /> },
  { path: "/users", element: <UsersPage /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "/import", element: <ImportPage /> },
  { path: "/metas", element: <MetasPage /> },
];

export default materialRoutes;
