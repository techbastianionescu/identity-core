import { useEffect, useState } from "react"
import { roleApi } from "@/api/endpoints"
import { useAuth } from "@/context/auth-context"
import type { Permission } from "@/types"

export function usePermissions() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (user?.role_id == null) {
        if (!cancelled) {
          setPermissions([])
          setLoading(false)
        }
        return
      }
      try {
        const roles = await roleApi.list()
        if (cancelled) return
        const myRole = roles.find((r) => r.id === user.role_id)
        setPermissions(myRole?.permissions ?? [])
      } catch {
        if (!cancelled) setPermissions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.role_id])

  const can = (permissionName: string) => permissions.some((p) => p.name === permissionName)

  return { permissions, loading, can }
}
