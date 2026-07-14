import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Search, AlertTriangle } from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { ESTADOS_PEDIDO } from '../../../services/orderService'
import Badge from '../../../components/ui/Badge'
import EmptyState from '../../../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../../../utils/format'

const ESTADOS = ESTADOS_PEDIDO
const BADGE_MAP = {
  pendiente_pago: 'warning',
  pagado:         'info',
  preparando:     'dark',
  enviado:        'dark',
  entregado:      'success',
  cancelado:      'danger',
  devuelto:       'default',
}

const ESTADO_LABEL = {
  pendiente_pago: 'Pago en proceso',
  pagado:         'Pagado',
  preparando:     'Preparando',
  enviado:        'Enviado',
  entregado:      'Entregado',
  cancelado:      'Cancelado',
  devuelto:       'Devuelto',
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { orders, counts, loading } = useOrders()
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      o.numero?.toLowerCase().includes(q) ||
      String(o.id).includes(q) ||
      o.cliente_nombre?.toLowerCase().includes(q) ||
      o.cliente_email?.toLowerCase().includes(q)
    const matchEstado = filterEstado ? o.estado === filterEstado : true
    return matchSearch && matchEstado
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="section-card px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Buscar por #pedido o cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 input-field text-sm" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setFilterEstado('')} className={`px-3 py-1.5 text-xs font-medium transition-all ${filterEstado === '' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Todos ({counts.total ?? 0})
            </button>
            {ESTADOS.map((e) => (
              <button key={e} onClick={() => setFilterEstado(e)} className={`px-3 py-1.5 text-xs font-medium transition-all ${filterEstado === e ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {ESTADO_LABEL[e]} ({counts[e] ?? 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="section-card">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Sin pedidos" description="No se encontraron pedidos con ese filtro." />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header px-5 py-3 text-left">#Pedido</th>
                <th className="table-header px-4 py-3 text-left">Cliente</th>
                <th className="table-header px-4 py-3 text-left">Fecha</th>
                <th className="table-header px-4 py-3 text-left">Método pago</th>
                <th className="table-header px-4 py-3 text-right">Total</th>
                <th className="table-header px-4 py-3 text-center">Estado</th>
                <th className="table-header px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell px-5">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-black">{order.numero}</p>
                      {order.alerta_stock && (
                        <AlertTriangle size={13} className="text-red-500 flex-shrink-0" title="Faltante de stock sin resolver" />
                      )}
                    </div>
                  </td>
                  <td className="table-cell px-4">
                    <div>
                      <p className="font-semibold text-black text-sm">{order.cliente_nombre}</p>
                      <p className="text-xs text-gray-400 truncate max-w-xs">{order.dir_snapshot?.ciudad}</p>
                    </div>
                  </td>
                  <td className="table-cell px-4 text-gray-500">{formatDate(order.creado_en)}</td>
                  <td className="table-cell px-4 text-gray-500">-</td>
                  <td className="table-cell px-4 text-right font-bold text-black">{formatCurrency(order.total)}</td>
                  <td className="table-cell px-4 text-center">
                    <Badge variant={BADGE_MAP[order.estado]}>{ESTADO_LABEL[order.estado]}</Badge>
                  </td>
                  <td className="table-cell px-4 text-center">
                    <button onClick={() => navigate(`/pedidos/${order.id}`)} className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-black transition-colors" title="Ver detalle">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
