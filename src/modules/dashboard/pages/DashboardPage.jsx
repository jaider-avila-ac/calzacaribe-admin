import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Users, Package, DollarSign, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react'
import { reportService } from '../../../services/reportService'
import { orderService } from '../../../services/orderService'
import { api } from '../../../services/api'
import StatCard from '../../../components/ui/StatCard'
import Badge from '../../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../../utils/format'

const BADGE_MAP = {
  pendiente_pago: 'warning', pagado: 'info', preparando: 'dark',
  enviado: 'dark', entregado: 'success', cancelado: 'danger', devuelto: 'default',
}
const ESTADO_LABEL = {
  pendiente_pago: 'Pago en proceso', pagado: 'Recibido', preparando: 'Preparando',
  enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado', devuelto: 'Devuelto',
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function DashboardPage() {
  const [resumen,       setResumen]       = useState(null)
  const [recentOrders,  setRecentOrders]  = useState([])
  const [lowStock,      setLowStock]      = useState([])
  const [byEstado,      setByEstado]      = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const mes = currentMonth()
    Promise.all([
      reportService.resumen(mes),
      orderService.getAll(),
      reportService.pedidosPorEstado(mes),
      api.get('/variantes/low-stock?limite=10'),
    ])
      .then(([res, orders, estados, stock]) => {
        setResumen(res)
        setRecentOrders((Array.isArray(orders) ? orders : []).slice(0, 6))
        setByEstado(Array.isArray(estados) ? estados : [])
        setLowStock(Array.isArray(stock) ? stock : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">Cargando dashboard…</div>
  }

  const pendingCount = resumen?.pedidos_en_proceso ?? 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos del mes"
          value={formatCurrency(resumen?.total_ingresos ?? 0)}
          subtitle="Pedidos entregados"
          icon={DollarSign}
        />
        <StatCard
          title="Pedidos del mes"
          value={resumen?.total_pedidos ?? 0}
          subtitle={`${pendingCount} en proceso`}
          icon={ShoppingBag}
        />
        <StatCard
          title="Clientes nuevos"
          value={resumen?.total_clientes ?? 0}
          subtitle="Registrados este mes"
          icon={Users}
        />
        <StatCard
          title="Productos"
          value={resumen?.total_productos ?? 0}
          subtitle={`${resumen?.productos_activos ?? 0} activos`}
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <div className="lg:col-span-2 section-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-black">Pedidos recientes</h2>
            <Link to="/pedidos" className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Sin pedidos aún</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <ShoppingBag size={18} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{order.numero} — {order.cliente_nombre}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.creado_en)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-black">{formatCurrency(order.total)}</p>
                    <Badge variant={BADGE_MAP[order.estado]} className="mt-0.5">{ESTADO_LABEL[order.estado]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="section-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-black">Stock bajo</h2>
            <Link to="/inventario" className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
              Ver todo <ArrowRight size={12} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-400">Todo el inventario en orden</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {lowStock.map((v) => (
                <div key={v.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.estado_stock === 'agotado' ? 'bg-red-600' : 'bg-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-black truncate">{v.producto_nombre ?? v.nombre}</p>
                    <p className="text-xs text-gray-400">{v.talla ?? ''}{v.color ? ` · ${v.color}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {v.estado_stock === 'agotado' && <AlertTriangle size={12} className="text-red-500" />}
                    <span className={`text-xs font-bold ${v.estado_stock === 'agotado' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {v.stock} uds
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pedidos por estado */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-bold text-black">Pedidos por estado</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-50">
          {['pagado', 'preparando', 'enviado', 'entregado'].map((estado) => {
            const found = byEstado.find((e) => e.estado === estado)
            return (
              <div key={estado} className="px-5 py-4 text-center">
                <Badge variant={BADGE_MAP[estado]}>{ESTADO_LABEL[estado]}</Badge>
                <p className="text-2xl font-black text-black mt-2">{found?.cantidad ?? 0}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(found?.total ?? 0)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
