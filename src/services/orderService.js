import { api } from './api'

export const ESTADOS_PEDIDO = [
  'pagado', 'preparando', 'enviado', 'entregado', 'cancelado', 'devuelto',
]

// Para las pestañas de filtro rápido en la tabla de Pedidos: "pagado" se omite ahí porque
// todo pedido que llega a esta lista ya está pagado (Wompi no deja crear uno si el pago no
// se aprobó) — como filtro no distingue nada. El estado en sí se mantiene intacto en
// ESTADOS_PEDIDO (el selector del detalle sí lo necesita, por si hay que retroceder a él).
export const ESTADOS_FILTRO_PEDIDOS = ESTADOS_PEDIDO.filter((e) => e !== 'pagado')

const BASE = '/pedidos'

export const orderService = {
  getAll:       (estado, colaboradorId) => {
    const params = new URLSearchParams()
    if (estado) params.set('estado', estado)
    if (colaboradorId) params.set('colaboradorId', colaboradorId)
    const qs = params.toString()
    return api.get(qs ? `${BASE}?${qs}` : BASE)
  },
  getCounts:    ()       => api.get(`${BASE}/conteos`),
  getColaboradores: ()   => api.get(`${BASE}/colaboradores`),
  asignarme:    (id)     => api.post(`${BASE}/${id}/asignarme`),
  asignar:      (id, colaboradorId) => api.patch(`${BASE}/${id}/asignar`, { colaborador_id: colaboradorId }),
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
