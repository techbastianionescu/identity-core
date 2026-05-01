export interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  role_id: number | null
}

export interface Permission {
  id: number
  name: string
  description: string | null
}

export interface Role {
  id: number
  name: string
  permissions: Permission[]
}

export interface LoginResponse {
  access_token: string
  token_type: string
}
