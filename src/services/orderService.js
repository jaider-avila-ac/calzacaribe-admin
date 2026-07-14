import { api } from './api'

export const ESTADOS_PEDIDO = [
  'pagado', 'preparando', 'enviado', 'entregado', 'cancelado', 'devuelto',
]

const BASE = '/pedidos'

export const orderService = {
  getAll:       (estado) => api.get(estado ? `${BASE}?estado=${estado}` : BASE),
  getCounts:    ()       => api.get(`${BASE}/conteos`),
  getById:      (id)     => api.get(`${BASE}/${id}`),
  updateEstado: (id, estado) => api.patch(`${BASE}/${id}/estado`, { estado }),
  resolverAlertaStock: (id) => api.post(`${BASE}/${id}/resolver-alerta-stock`),
  updateSeguimiento: (id, { transportadora, codigoRastreo, link, mostrar }) =>
    api.patch(`${BASE}/${id}/link-seguimiento`, {
      transportadora,
      codigo_rastreo: codigoRastreo,
      link,
      mostrar,
    }),
}
