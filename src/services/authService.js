const API = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1`
const TOKEN_KEY = 'calzacaribe_admin_token'
const USER_KEY  = 'calzacaribe_admin_user'

export const authService = {
  login: async (email, password) => {
    const res = await fetch(`${API}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': '1' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error ?? 'Credenciales incorrectas')
    }
    const data = await res.json()
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify({ email: data.email, nombre: data.nombre, rol: data.rol }))
    return data
  },

  // Invalida el token en el backend (best-effort) antes de borrarlo localmente —
  // si no, seguiría siendo válido hasta su vencimiento aunque alguien más lo tuviera.
  logout: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      await fetch(`${API}/auth/admin/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'X-Tenant-Id': '1' },
      }).catch(() => {})
    }
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
    const data = await res.json()
    // Refresca nombre/rol guardados por si cambiaron desde el último login (ej. un superadmin
    // le cambió el rol a este usuario en otra sesión).
    localStorage.setItem(USER_KEY, JSON.stringify({ email: data.email, nombre: data.nombre, rol: data.rol }))
    return data
  },
}
