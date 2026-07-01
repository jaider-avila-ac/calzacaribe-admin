import { api } from './api'

const BASE = '/productos'

export const productService = {
  getAll:    (catId) => api.get(catId ? `${BASE}?catId=${catId}` : BASE),
  getById:   (id)   => api.get(`${BASE}/${id}`),
  create:    (data) => api.post(BASE, data),
  update:    (id, data) => api.put(`${BASE}/${id}`, data),
  remove:    (id)   => api.delete(`${BASE}/${id}`),
}
