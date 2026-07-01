import { api } from './api'

export const ESTADOS_PEDIDO = [
  'pendiente_pago', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado', 'devuelto',
]

const BASE = '/pedidos'

export const orderService = {
  getAll:       (estado) => api.get(estado ? `${BASE}?estado=${estado}` : BASE),
  getById:      (id)     => api.get(`${BASE}/${id}`),
  updateEstado: (id, estado) => api.patch(`${BASE}/${id}/estado`, { estado }),
}
