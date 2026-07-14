import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, Users } from 'lucide-react'
import { reportService } from '../../../services/reportService'
import { formatCurrency } from '../../../utils/format'

const ESTADO_LABEL = {
  pendiente_pago: 'Pago en proceso', pagado: 'Recibido', preparando: 'Preparando',
  enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado', devuelto: 'Devuelto',
}
const ESTADO_COLORS = {
  pendiente_pago: 'bg-yellow-400', pagado: 'bg-violet-500', preparando: 'bg-gray-500',
  enviado: 'bg-gray-700', entregado: 'bg-admin-accent', cancelado: 'bg-red-500', devuelto: 'bg-orange-400',
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(mes) {
  const [year, month] = mes.split('-').map(Number)
  return new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })
    .format(new Date(year, month - 1, 1))
}

export default function ReportsPage() {
  const [mes,           setMes]           = useState(() => currentMonth())
  const [resumen,       setResumen]       = useState(null)
  const [byEstado,      setByEstado]      = useState([])
  const [topProductos,  setTopProductos]  = useState([])
  const [porCategoria,  setPorCategoria]  = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      reportService.resumen(mes),
      reportService.pedidosPorEstado(mes),
      reportService.productosMasVendidos(mes),
      reportService.ventasPorCategoria(mes),
    ])
      .then(([res, estados, productos, categorias]) => {
        setResumen(res)
        setByEstado(Array.isArray(estados)    ? estados    : [])
        setTopProductos(Array.isArray(productos)  ? productos  : [])
        setPorCategoria(Array.isArray(categorias) ? categorias : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [mes])

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">Cargando reportes…</div>
  }

  return (
    <div className="space-y-6">
      <div className="section-card px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-black">Periodo</h2>
          <p className="text-xs text-gray-400 capitalize">{monthLabel(mes)}</p>
        </div>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value || currentMonth())}
          className="input-field w-auto text-sm"
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos del mes',  value: formatCurrency(resumen?.total_ingresos ?? 0),  icon: TrendingUp },
          { label: 'Pedidos del mes',   value: resumen?.total_pedidos ?? 0,                    icon: ShoppingBag },
          { label: 'Ticket promedio',   value: formatCurrency(resumen?.ticket_promedio ?? 0),  icon: ShoppingBag },
          { label: 'Clientes nuevos',   value: resumen?.total_clientes ?? 0,                   icon: Users },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="section-card p-5 text-center">
              <Icon size={20} className="text-icon-mono mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <p className="text-2xl font-black text-black mt-1">{kpi.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos por estado */}
        <div className="section-card p-5">
          <h2 className="text-sm font-bold text-black mb-4">Pedidos por estado</h2>
          <div className="space-y-3">
            {byEstado.map(({ estado, cantidad, porcentaje_grafica }) => (
              <div key={estado} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{ESTADO_LABEL[estado] ?? estado}</span>
                <div className="flex-1 bg-gray-100 h-2.5 overflow-hidden">
                  <div
                    className={`h-full ${ESTADO_COLORS[estado] ?? 'bg-gray-400'} transition-all`}
                    style={{ width: `${porcentaje_grafica}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-black w-6 text-right">{cantidad}</span>
              </div>
            ))}
            {byEstado.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>}
          </div>
        </div>

        {/* Ventas por categoría */}
        <div className="section-card p-5">
          <h2 className="text-sm font-bold text-black mb-4">Ventas por categoría</h2>
          <div className="space-y-3">
            {porCategoria.map(({ categoria, total, unidades, porcentaje_grafica }) => (
              <div key={categoria} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 flex-shrink-0 truncate">{categoria}</span>
                <div className="flex-1 bg-gray-100 h-2.5 overflow-hidden">
                  <div className="h-full bg-black transition-all" style={{ width: `${porcentaje_grafica}%` }} />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-black">{formatCurrency(total)}</p>
                  <p className="text-[10px] text-gray-400">{unidades} uds</p>
                </div>
              </div>
            ))}
            {porCategoria.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>}
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="section-card p-5">
          <h2 className="text-sm font-bold text-black mb-4">Productos más vendidos</h2>
          {topProductos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {topProductos.map((p, i) => (
                <div key={p.prd_id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 ? 'bg-admin-accent text-admin-accent-contrast' : 'bg-gray-100 text-gray-600'}`}>
                    {i + 1}
                  </div>
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt="" className="w-9 h-9 object-cover bg-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-black truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(p.total)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-black">{p.unidades}</p>
                    <p className="text-xs text-gray-400">vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen del periodo */}
        <div className="section-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-black capitalize">{monthLabel(mes)}</h2>
          <div className="space-y-3">
            {[
              { label: 'Ingresos', valor: formatCurrency(resumen?.total_ingresos ?? 0) },
              { label: 'Pedidos',  valor: resumen?.total_pedidos ?? 0 },
              { label: 'Clientes nuevos', valor: resumen?.total_clientes ?? 0 },
            ].map(({ label, valor }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <div className="text-right">
                  <p className="text-sm font-black text-black">{valor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
