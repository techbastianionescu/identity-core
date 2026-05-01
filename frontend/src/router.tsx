import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute } from "@/components/protected-route"
import { Layout } from "@/components/layout"
import LoginPage from "@/pages/login"
import DashboardPage from "@/pages/dashboard"
import UsersPage from "@/pages/users"
import RolesPage from "@/pages/roles"
import PermissionsPage from "@/pages/permissions"
import MePage from "@/pages/me"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/users", element: <UsersPage /> },
          { path: "/roles", element: <RolesPage /> },
          { path: "/permissions", element: <PermissionsPage /> },
          { path: "/me", element: <MePage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
