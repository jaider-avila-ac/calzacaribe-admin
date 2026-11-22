import { api } from './api'

const BASE = '/tienda/cupones'

export const cuponService = {
  getAll: ()                   => api.get(BASE),
  create: (data)                => api.post(BASE, data),
  cambiarActivo: (id, activo)   => api.patch(`${BASE}/${id}/activo`, { activo }),
}
