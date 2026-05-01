import { useEffect, useState } from "react"
import { Users, Shield, Key, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { permissionApi, roleApi, userApi } from "@/api/endpoints"
import type { Permission, Role, User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/page-header"
import { NoPermission } from "@/components/no-permission"

const PREVIEW_LIMIT = 5

interface AsyncState<T> {
  data: T
  loading: boolean
  forbidden: boolean
}

function useAsyncList<T>(loader: () => Promise<T[]>): AsyncState<T[]> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    let cancelled = false
    loader()
      .then((d) => !cancelled && setData(d))
      .catch((e) => {
        if (cancelled) return
        if (e?.response?.status === 403) setForbidden(true)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, forbidden }
}

export default function DashboardPage() {
  const usersState = useAsyncList<User>(() => userApi.list())
  const rolesState = useAsyncList<Role>(() => roleApi.list())
  const permissionsState = useAsyncList<Permission>(() => permissionApi.list())

  const getRoleName = (roleId: number | null) => {
    if (roleId === null) return null
    return rolesState.data.find((r) => r.id === roleId)?.name ?? null
  }

  const usedPermissionIds = new Set(rolesState.data.flatMap((r) => r.permissions.map((p) => p.id)))

  return (
    <>
      <PageHeader title="Dashboard" description="Vista general del sistema" />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <DashboardCard
          label="Usuarios"
          icon={Users}
          state={usersState}
          link="/users"
          linkLabel="Ver todos los usuarios"
          renderItem={(u) => {
            const roleName = getRoleName(u.role_id)
            return (
              <div key={u.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-zinc-500"}`}
                  />
                  <span className="font-medium truncate">{u.username}</span>
                </div>
                {roleName ? (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {roleName}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground shrink-0">Sin rol</span>
                )}
              </div>
            )
          }}
        />

        <DashboardCard
          label="Roles"
          icon={Shield}
          state={rolesState}
          link="/roles"
          linkLabel="Ver todos los roles"
          renderItem={(r) => {
            const userCount = usersState.data.filter((u) => u.role_id === r.id).length
            return (
              <div key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <Badge variant="secondary" className="shrink-0">
                  {r.name}
                </Badge>
                <span className="text-xs text-muted-foreground shrink-0">
                  {r.permissions.length} {r.permissions.length === 1 ? "permiso" : "permisos"} ·{" "}
                  {userCount} {userCount === 1 ? "usuario" : "usuarios"}
                </span>
              </div>
            )
          }}
        />

        <DashboardCard
          label="Permisos"
          icon={Key}
          state={permissionsState}
          link="/permissions"
          linkLabel="Ver todos los permisos"
          renderItem={(p) => {
            const inUse = usedPermissionIds.has(p.id)
            return (
              <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="font-mono text-xs truncate">{p.name}</span>
                <span
                  className={`text-xs shrink-0 ${
                    inUse ? "text-emerald-500" : "text-muted-foreground"
                  }`}
                >
                  {inUse ? "En uso" : "Sin uso"}
                </span>
              </div>
            )
          }}
        />
      </div>
    </>
  )
}

interface DashboardCardProps<T> {
  label: string
  icon: React.ComponentType<{ className?: string }>
  state: AsyncState<T[]>
  link: string
  linkLabel: string
  renderItem: (item: T) => React.ReactNode
}

function DashboardCard<T>({
  label,
  icon: Icon,
  state,
  link,
  linkLabel,
  renderItem,
}: DashboardCardProps<T>) {
  const { data, loading, forbidden } = state
  const preview = data.slice(0, PREVIEW_LIMIT)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {forbidden ? (
          <NoPermission />
        ) : (
          <>
            <div className="text-4xl font-semibold mb-4">
              {loading ? <span className="text-muted-foreground">…</span> : data.length}
            </div>
            <Separator className="mb-3" />
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : data.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Sin elementos</p>
            ) : (
              <div className="space-y-2 flex-1">
                {preview.map(renderItem)}
                {data.length > PREVIEW_LIMIT && (
                  <p className="text-xs text-muted-foreground pt-1">
                    + {data.length - PREVIEW_LIMIT} más
                  </p>
                )}
              </div>
            )}
            <Link
              to={link}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-4"
            >
              {linkLabel}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
