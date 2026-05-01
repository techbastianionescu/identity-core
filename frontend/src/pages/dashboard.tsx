import { useEffect, useState } from "react"
import { Users, Shield, Key, Sparkles } from "lucide-react"
import { permissionApi, roleApi, userApi } from "@/api/endpoints"
import type { Permission, Role, User } from "@/types"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"

export default function DashboardPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [u, r, p] = await Promise.all([
          userApi.list(),
          roleApi.list(),
          permissionApi.list(),
        ])
        setUsers(u)
        setRoles(r)
        setPermissions(p)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const myRole = roles.find((r) => r.id === user?.role_id) ?? null
  const myPermissions = myRole?.permissions ?? []
  const usersByRole = (roleId: number) => users.filter((u) => u.role_id === roleId).length

  const stats = [
    { label: "Usuarios", value: users.length, icon: Users },
    { label: "Roles", value: roles.length, icon: Shield },
    { label: "Permisos", value: permissions.length, icon: Key },
  ]

  return (
    <>
      <PageHeader title="Dashboard" description="Vista general del sistema" />

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Bienvenido, {user?.username}</CardTitle>
          </div>
          <CardDescription>
            {myRole ? (
              <>
                Tu rol es <span className="text-foreground font-medium">{myRole.name}</span> ·{" "}
                {myPermissions.length} {myPermissions.length === 1 ? "permiso" : "permisos"}
              </>
            ) : (
              "No tienes ningún rol asignado"
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {loading ? <span className="text-muted-foreground">…</span> : value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles del sistema</CardTitle>
            <CardDescription>Roles definidos y permisos que agrupan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay roles</p>
            ) : (
              roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{role.name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {usersByRole(role.id)} {usersByRole(role.id) === 1 ? "usuario" : "usuarios"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {role.permissions.length}{" "}
                    {role.permissions.length === 1 ? "permiso" : "permisos"}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tus permisos</CardTitle>
            <CardDescription>Acciones que puedes realizar a través de tu rol</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : myPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {myRole ? "Tu rol no tiene permisos asignados" : "Necesitas un rol para tener permisos"}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {myPermissions.map((p) => (
                  <Badge key={p.id} variant="outline" className="font-mono text-xs">
                    {p.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
