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
  cancelar: (id, { motivo, motivoOtro, nota }) =>
    api.post(`${BASE}/${id}/cancelar`, { motivo, motivo_otro: motivoOtro, nota }),
  getHistorial: (id) => api.get(`${BASE}/${id}/historial-estados`),
}

export const MOTIVOS_CANCELACION = [
  { value: 'producto_agotado',      label: 'Producto agotado' },
  { value: 'producto_inconveniente', label: 'Producto con inconvenientes' },
  { value: 'error_precio',          label: 'Error en el precio o la publicación' },
  { value: 'envio_imposible',       label: 'Imposibilidad de realizar el envío' },
  { value: 'compra_duplicada',      label: 'Compra duplicada' },
  { value: 'acordado_cliente',      label: 'Solicitud acordada con el cliente' },
  { value: 'otro',                  label: 'Otro motivo' },
]
