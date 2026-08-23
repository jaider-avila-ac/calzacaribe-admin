import { api } from './api'

const BASE = '/reportes'

function withFiltros(path, mes, colaboradorId, sucursalId) {
  const params = new URLSearchParams()
  if (mes) params.set('mes', mes)
  if (colaboradorId) params.set('colaboradorId', colaboradorId)
  if (sucursalId) params.set('sucursalId', sucursalId)
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

export const reportService = {
  resumen:              (mes, colaboradorId, sucursalId) => api.get(withFiltros(`${BASE}/resumen`, mes, colaboradorId, sucursalId)),
  pedidosPorEstado:     (mes, colaboradorId, sucursalId) => api.get(withFiltros(`${BASE}/pedidos-por-estado`, mes, colaboradorId, sucursalId)),
  productosMasVendidos: (mes, colaboradorId, sucursalId) => api.get(withFiltros(`${BASE}/productos-mas-vendidos`, mes, colaboradorId, sucursalId)),
  ventasPorCategoria:   (mes, colaboradorId, sucursalId) => api.get(withFiltros(`${BASE}/ventas-por-categoria`, mes, colaboradorId, sucursalId)),
  ventasPorCanal:       (mes, colaboradorId, sucursalId) => api.get(withFiltros(`${BASE}/ventas-por-canal`, mes, colaboradorId, sucursalId)),
}
