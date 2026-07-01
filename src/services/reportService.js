import { api } from './api'

const BASE = '/reportes'

function withMonth(path, mes) {
  return mes ? `${path}?mes=${encodeURIComponent(mes)}` : path
}

export const reportService = {
  resumen:              (mes) => api.get(withMonth(`${BASE}/resumen`, mes)),
  pedidosPorEstado:     (mes) => api.get(withMonth(`${BASE}/pedidos-por-estado`, mes)),
  productosMasVendidos: (mes) => api.get(withMonth(`${BASE}/productos-mas-vendidos`, mes)),
  ventasPorCategoria:   (mes) => api.get(withMonth(`${BASE}/ventas-por-categoria`, mes)),
}
