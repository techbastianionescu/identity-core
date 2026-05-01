import { useEffect, useState, type FormEvent } from "react"
import { Plus, Shield, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { roleApi, userApi } from "@/api/endpoints"
import type { Role, User } from "@/types"
import { useAuth } from "@/context/auth-context"
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

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { can } = usePermissions()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "" })

  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")

  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ username: "", email: "", is_active: true })

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<User | null>(null)

  const [submitting, setSubmitting] = useState(false)

  const errorMessage = (e: unknown) =>
    (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Error inesperado"

  const load = async () => {
    setLoading(true)
    try {
      const u = await userApi.list()
      setUsers(u)
      try {
        setRoles(await roleApi.list())
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

  const getRoleName = (roleId: number | null) => {
    if (roleId === null) return null
    return roles.find((r) => r.id === roleId)?.name ?? `id:${roleId}`
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await userApi.register(newUser.username, newUser.email, newUser.password)
      toast.success("Usuario creado")
      setNewUser({ username: "", email: "", password: "" })
      setCreateOpen(false)
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setEditForm({ username: u.username, email: u.email, is_active: u.is_active })
    setEditOpen(true)
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSubmitting(true)
    try {
      await userApi.update(editing.id, editForm)
      toast.success("Usuario actualizado")
      setEditOpen(false)
      setEditing(null)
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const openDelete = (u: User) => {
    setDeleting(u)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSubmitting(true)
    try {
      await userApi.remove(deleting.id)
      toast.success("Usuario eliminado")
      setDeleteOpen(false)
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssign = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setSubmitting(true)
    try {
      const roleId = selectedRoleId === "" ? null : parseInt(selectedRoleId)
      await userApi.assignRole(selectedUser.id, roleId)
      toast.success(roleId === null ? "Rol quitado al usuario" : "Rol asignado al usuario")
      setAssignOpen(false)
      setSelectedUser(null)
      setSelectedRoleId("")
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
        title="Usuarios"
        description="Lista de usuarios registrados en el sistema"
        actions={
          can("users:create") && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  Nuevo usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Crear usuario</DialogTitle>
                    <DialogDescription>
                      El usuario se creará sin rol. Puedes asignárselo después.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuario</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                        minLength={6}
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
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-48 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const roleName = getRoleName(u.role_id)
                  const isSelf = u.id === currentUser?.id
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-muted-foreground">{u.id}</TableCell>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        {roleName ? (
                          <Badge variant="secondary">{roleName}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin rol</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? "default" : "outline"}>
                          {u.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {can("users:assign_role") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Asignar rol"
                              onClick={() => {
                                setSelectedUser(u)
                                setSelectedRoleId(u.role_id?.toString() ?? "")
                                setAssignOpen(true)
                              }}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          )}
                          {can("users:update") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar usuario"
                              onClick={() => openEdit(u)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {can("users:delete") && !isSelf && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar usuario"
                              onClick={() => openDelete(u)}
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

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <form onSubmit={handleAssign}>
            <DialogHeader>
              <DialogTitle>Asignar rol a "{selectedUser?.username}"</DialogTitle>
              <DialogDescription>
                Selecciona un rol o deja vacío para quitarle el rol actual
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sin rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar usuario</DialogTitle>
              <DialogDescription>Modifica los datos básicos del usuario</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Usuario</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-active"
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-active" className="cursor-pointer">
                  Usuario activo
                </Label>
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
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar al usuario{" "}
              <code className="text-foreground">{deleting?.username}</code>? Esta acción no se puede
              deshacer.
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
