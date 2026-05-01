import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, Users, Shield, Key, UserCircle, LogOut, Fingerprint } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Usuarios", icon: Users },
  { to: "/roles", label: "Roles", icon: Shield },
  { to: "/permissions", label: "Permisos", icon: Key },
  { to: "/me", label: "Mi perfil", icon: UserCircle },
]

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 border-r border-border flex flex-col bg-sidebar">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Fingerprint className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Identity Core</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{user?.username}</div>
            <div className="truncate">{user?.email}</div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
