const API = 'http://localhost:8080/api/v1'
const TOKEN_KEY = 'calzacaribe_admin_token'
const USER_KEY  = 'calzacaribe_admin_user'

export const authService = {
  login: async (email, password) => {
    const res = await fetch(`${API}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Credenciales incorrectas')
    }
    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify({ email: data.email, nombre: data.nombre }))
    return data
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  },

  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),

  // Verifica contra el backend si el token sigue siendo válido.
  // Lanza error si el token expiró, es inválido o el backend no responde.
  verify: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('no token')
    const res = await fetch(`${API}/auth/admin/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Id': '1',
      },
    })
    if (!res.ok) throw new Error('invalid')
    return res.json()
  },
}
