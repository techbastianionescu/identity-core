import { useEffect, useState } from "react"
import { LogOut, UserCircle, Mail, Shield, Hash, Key } from "lucide-react"
import { roleApi } from "@/api/endpoints"
import type { Role } from "@/types"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"

export default function MePage() {
  const { user, logout } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    roleApi.list().then(setRoles).catch(() => undefined)
  }, [])

  const myRole = user?.role_id != null ? roles.find((r) => r.id === user.role_id) ?? null : null
  const myPermissions = myRole?.permissions ?? []

  if (!user) return null

  const fields = [
    { label: "ID", value: user.id, icon: Hash },
    { label: "Usuario", value: user.username, icon: UserCircle },
    { label: "Email", value: user.email, icon: Mail },
  ]

  return (
    <>
      <PageHeader title="Mi perfil" description="Datos de tu cuenta y permisos" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="text-xl font-semibold">{user.username}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-medium">{value}</div>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">Rol</div>
                  <div className="text-sm font-medium">
                    {myRole ? (
                      <Badge variant="secondary">{myRole.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Sin rol</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-4 w-4 mt-0.5 flex items-center justify-center">
                  <div
                    className={`h-2 w-2 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-zinc-500"}`}
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Estado</div>
                  <div className="text-sm font-medium">{user.is_active ? "Activo" : "Inactivo"}</div>
                </div>
              </div>
            </div>

            <Separator />

            <Button variant="destructive" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Permisos efectivos</CardTitle>
            </div>
            <CardDescription>
              {myRole
                ? `Permisos heredados de tu rol "${myRole.name}"`
                : "Necesitas un rol para tener permisos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myPermissions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {myRole ? "Tu rol no tiene permisos" : "Sin rol asignado"}
              </p>
            ) : (
              <div className="space-y-2">
                {myPermissions.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-md border border-border bg-card"
                  >
                    <div className="font-mono text-xs font-medium">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-muted-foreground mt-1">{p.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
