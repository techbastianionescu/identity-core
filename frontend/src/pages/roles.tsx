import { useEffect, useState, type FormEvent } from "react"
import { Plus, Link2, Shield } from "lucide-react"
import { toast } from "sonner"
import { permissionApi, roleApi, userApi } from "@/api/endpoints"
import type { Permission, Role, User } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermissionId, setSelectedPermissionId] = useState<string>("")

  const load = async () => {
    setLoading(true)
    try {
      const [r, p, u] = await Promise.all([
        roleApi.list(),
        permissionApi.list(),
        userApi.list().catch(() => [] as User[]),
      ])
      setRoles(r)
      setPermissions(p)
      setUsers(u)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await roleApi.create(name)
      toast.success("Rol creado")
      setName("")
      setCreateOpen(false)
      await load()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Error creando rol"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedRole || !selectedPermissionId) return
    setSubmitting(true)
    try {
      await permissionApi.assignToRole(selectedRole.id, parseInt(selectedPermissionId))
      toast.success("Permiso asignado al rol")
      setAssignOpen(false)
      setSelectedRole(null)
      setSelectedPermissionId("")
      await load()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Error asignando permiso"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const usersByRole = (roleId: number) => users.filter((u) => u.role_id === roleId).length

  const availablePermissions = (role: Role) =>
    permissions.filter((p) => !role.permissions.some((rp) => rp.id === p.id))

  return (
    <>
      <PageHeader
        title="Roles"
        description="Agrupan permisos y se asignan a usuarios"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Nuevo rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Crear rol</DialogTitle>
                  <DialogDescription>El nombre debe ser único en el sistema</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="editor"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creando..." : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : roles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No hay roles. Crea el primero.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => {
            const userCount = usersByRole(role.id)
            return (
              <Card key={role.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{role.name}</h3>
                          <span className="text-xs text-muted-foreground">#{role.id}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {userCount} {userCount === 1 ? "usuario" : "usuarios"} ·{" "}
                          {role.permissions.length}{" "}
                          {role.permissions.length === 1 ? "permiso" : "permisos"}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role)
                        setSelectedPermissionId("")
                        setAssignOpen(true)
                      }}
                      disabled={availablePermissions(role).length === 0}
                    >
                      <Link2 className="h-4 w-4" />
                      Asignar permiso
                    </Button>
                  </div>

                  <Separator className="mb-4" />

                  {role.permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Este rol no tiene permisos asignados
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((p) => (
                        <Badge key={p.id} variant="outline" className="font-mono text-xs">
                          {p.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <form onSubmit={handleAssign}>
            <DialogHeader>
              <DialogTitle>Asignar permiso al rol "{selectedRole?.name}"</DialogTitle>
              <DialogDescription>
                Solo se muestran los permisos que aún no están asignados a este rol
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="permission">Permiso</Label>
                <select
                  id="permission"
                  value={selectedPermissionId}
                  onChange={(e) => setSelectedPermissionId(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecciona un permiso</option>
                  {selectedRole &&
                    availablePermissions(selectedRole).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting || !selectedPermissionId}>
                {submitting ? "Asignando..." : "Asignar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
