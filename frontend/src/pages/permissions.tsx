import { useEffect, useState, type FormEvent } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { permissionApi, roleApi } from "@/api/endpoints"
import type { Permission, Role } from "@/types"
import { usePermissions } from "@/hooks/use-permissions"
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
import { NoPermission } from "@/components/no-permission"

export default function PermissionsPage() {
  const { can } = usePermissions()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDescription, setCreateDescription] = useState("")

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Permission | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<Permission | null>(null)

  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const p = await permissionApi.list()
      setPermissions(p)
      try {
        const r = await roleApi.list()
        setRoles(r)
      } catch {
        setRoles([])
      }
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 403) setForbidden(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const rolesByPermission = (permissionId: number) =>
    roles.filter((r) => r.permissions.some((p) => p.id === permissionId))

  const errorMessage = (e: unknown) =>
    (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Error inesperado"

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await permissionApi.create(createName, createDescription || null)
      toast.success("Permiso creado")
      setCreateName("")
      setCreateDescription("")
      setCreateOpen(false)
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (p: Permission) => {
    setEditing(p)
    setEditName(p.name)
    setEditDescription(p.description ?? "")
    setEditOpen(true)
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSubmitting(true)
    try {
      await permissionApi.update(editing.id, {
        name: editName,
        description: editDescription || null,
      })
      toast.success("Permiso actualizado")
      setEditOpen(false)
      setEditing(null)
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const openDelete = (p: Permission) => {
    setDeleting(p)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSubmitting(true)
    try {
      await permissionApi.remove(deleting.id)
      toast.success("Permiso eliminado")
      setDeleteOpen(false)
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Permisos"
        description="Define qué acciones puede realizar cada rol"
        actions={
          can("permissions:create") && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  Nuevo permiso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Crear permiso</DialogTitle>
                    <DialogDescription>
                      Convención sugerida: <code className="text-xs">recurso:accion</code>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="users:delete"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción (opcional)</Label>
                      <Input
                        id="description"
                        value={createDescription}
                        onChange={(e) => setCreateDescription(e.target.value)}
                        placeholder="Permite eliminar usuarios"
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
          )
        }
      />

      {forbidden ? (
        <Card>
          <NoPermission />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Roles que lo usan</TableHead>
                <TableHead className="w-32 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : permissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay permisos
                  </TableCell>
                </TableRow>
              ) : (
                permissions.map((p) => {
                  const usedBy = rolesByPermission(p.id)
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">{p.id}</TableCell>
                      <TableCell className="font-mono text-sm">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {p.description || "—"}
                      </TableCell>
                      <TableCell>
                        {usedBy.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">Sin uso</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {usedBy.map((r) => (
                              <Badge key={r.id} variant="secondary" className="text-xs">
                                {r.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {can("permissions:update") && (
                            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {can("permissions:delete") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDelete(p)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar permiso</DialogTitle>
              <DialogDescription>
                Modifica el nombre o la descripción del permiso
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar permiso</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar el permiso{" "}
              <code className="text-foreground">{deleting?.name}</code>? Esta acción no se puede
              deshacer y se quitará automáticamente de todos los roles que lo tengan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
