export type UserRole = 'operator' | 'supervisor'

export interface UserInfo {
  id: string
  username: string
  nickname: string
  role: UserRole
  avatar?: string
  team?: string
}

export function getDefaultHome(role: UserRole | string | null | undefined): string {
  switch (role) {
    case 'operator':
      return '/workorder'
    case 'supervisor':
      return '/dashboard'
    default:
      return '/login'
  }
}

export function hasPermission(
  allowedRoles: string[] | undefined,
  userRole: string | null | undefined
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function setUser(user: UserInfo) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

export function removeUser() {
  localStorage.removeItem(USER_KEY)
}

export function clearAuth() {
  removeToken()
  removeUser()
}

export function isLoggedIn(): boolean {
  return !!getToken() && !!getUser()
}

export function getCurrentRole(): UserRole | null {
  const user = getUser()
  return user?.role || null
}
