export type AdminUser = {
  name: string
  email: string
  role: string
}

export type AuthContextValue = {
  user: AdminUser | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}
