import { useEffect, useState, type FormEvent } from "react"
import { Plus } from "lucide-react"
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

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [p, r] = await Promise.all([permissionApi.list(), roleApi.list()])
      setPermissions(p)
      setRoles(r)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const rolesByPermission = (permissionId: number) =>
    roles.filter((r) => r.permissions.some((p) => p.id === permissionId))

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await permissionApi.create(name, description || null)
      toast.success("Permiso creado")
      setName("")
      setDescription("")
      setOpen(false)
      await load()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Error creando permiso"
      toast.error(message)
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
          <Dialog open={open} onOpenChange={setOpen}>
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
                    Convención sugerida: <code className="text-xs">recurso:accion</code> (ej.{" "}
                    <code className="text-xs">users:read</code>)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="users:delete"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Roles que lo usan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
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
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  )
}
