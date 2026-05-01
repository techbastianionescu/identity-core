import { useEffect, useState } from "react"
import { Users, Shield, Key } from "lucide-react"
import { permissionApi, roleApi, userApi } from "@/api/endpoints"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"

interface Stats {
  users: number
  roles: number
  permissions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [users, roles, permissions] = await Promise.all([
          userApi.list(),
          roleApi.list(),
          permissionApi.list(),
        ])
        setStats({ users: users.length, roles: roles.length, permissions: permissions.length })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { label: "Usuarios", value: stats?.users, icon: Users },
    { label: "Roles", value: stats?.roles, icon: Shield },
    { label: "Permisos", value: stats?.permissions, icon: Key },
  ]

  return (
    <>
      <PageHeader title="Dashboard" description="Vista general del sistema" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
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
    </>
  )
}
