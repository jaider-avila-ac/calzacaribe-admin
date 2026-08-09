import { api } from './api'

export const sucursalService = {
  list: () => api.get('/sucursales'),
}
