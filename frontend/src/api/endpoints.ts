import { api } from "./client"
import type { LoginResponse, Permission, Role, User } from "@/types"

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", { username, password })
    return data
  },
}

export const userApi = {
  me: async (): Promise<User> => {
    const { data } = await api.get<User>("/users/me")
    return data
  },
  register: async (username: string, email: string, password: string): Promise<User> => {
    const { data } = await api.post<User>("/users/register", { username, email, password })
    return data
  },
  assignRole: async (userId: number, roleId: number): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${userId}/role`, { role_id: roleId })
    return data
  },
}

export const roleApi = {
  list: async (): Promise<Role[]> => {
    const { data } = await api.get<Role[]>("/roles/")
    return data
  },
  create: async (name: string): Promise<Role> => {
    const { data } = await api.post<Role>("/roles/", { name })
    return data
  },
}

export const permissionApi = {
  list: async (): Promise<Permission[]> => {
    const { data } = await api.get<Permission[]>("/permissions/")
    return data
  },
  create: async (name: string, description: string | null): Promise<Permission> => {
    const { data } = await api.post<Permission>("/permissions/", { name, description })
    return data
  },
  assignToRole: async (roleId: number, permissionId: number): Promise<Permission> => {
    const { data } = await api.post<Permission>(
      `/permissions/roles/${roleId}/assign`,
      { permission_id: permissionId }
    )
    return data
  },
}
