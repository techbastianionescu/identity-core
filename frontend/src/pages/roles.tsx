import { useEffect, useState, type FormEvent } from "react"
import { Plus, Link2 } from "lucide-react"
import { toast } from "sonner"
import { permissionApi, roleApi } from "@/api/endpoints"
import type { Permission, Role } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
      const [r, p] = await Promise.all([roleApi.list(), permissionApi.list()])
      setRoles(r)
      setPermissions(p)
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
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Error asignando permiso"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-48 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No hay roles
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="text-muted-foreground">{role.id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRole(role)
                        setAssignOpen(true)
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                      Asignar permiso
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <form onSubmit={handleAssign}>
            <DialogHeader>
              <DialogTitle>Asignar permiso al rol "{selectedRole?.name}"</DialogTitle>
              <DialogDescription>
                Selecciona el permiso que quieres añadir a este rol
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
                  {permissions.map((p) => (
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
