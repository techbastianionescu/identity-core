import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Shield,
  Key,
  UserCircle,
  LogOut,
  Fingerprint,
  Menu,
  X,
} from "lucide-react"
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
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 z-30 flex items-center justify-between px-4 bg-sidebar border-b border-border">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-primary" />
          <span className="font-semibold">Identity Core</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky inset-y-0 left-0 z-40 w-64 border-r border-border flex-col bg-sidebar transition-transform duration-200 ease-out",
          "lg:flex lg:translate-x-0 lg:top-0 lg:h-screen",
          mobileOpen ? "flex translate-x-0" : "hidden -translate-x-full lg:flex"
        )}
      >
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Fingerprint className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Identity Core</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            <div className="font-medium text-foreground truncate">{user?.username}</div>
            <div className="truncate">{user?.email}</div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
