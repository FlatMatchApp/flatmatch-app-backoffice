export type AdminUser = {
  name: string
  email: string
  role: string
}

export type AuthContextValue = {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
