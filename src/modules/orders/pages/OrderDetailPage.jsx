import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, CreditCard, Package, Truck, AlertTriangle, Link2 } from 'lucide-react'
import { orderService, ESTADOS_PEDIDO } from '../../../services/orderService'
import Badge from '../../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../../utils/format'

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
  pagado:         'Recibido',
  preparando:     'Preparando',
  enviado:        'Enviado',
  entregado:      'Entregado',
  cancelado:      'Cancelado',
  devuelto:       'Devuelto',
}

export default function OrderDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [linkInput, setLinkInput] = useState('')
  const [savingLink, setSavingLink] = useState(false)
  const [linkError, setLinkError] = useState('')

  const load = () => {
    setLoading(true)
    orderService.getById(id)
      .then((data) => { setOrder(data); setLinkInput(data.link_seguimiento ?? '') })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleResolverAlerta = async () => {
    setResolving(true)
    try {
      await orderService.resolverAlertaStock(id)
      load()
    } finally {
      setResolving(false)
    }
  }

  const handleGuardarLink = async () => {
    setSavingLink(true)
    setLinkError('')
    try {
      await orderService.updateLinkSeguimiento(id, linkInput.trim())
      load()
    } catch (err) {
      setLinkError(err.message || 'No se pudo guardar el link')
    } finally {
      setSavingLink(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-400">Cargando pedido…</div>
  }

  if (notFound || !order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Pedido no encontrado</p>
        <button onClick={() => navigate('/pedidos')} className="btn-primary mt-4 mx-auto">Volver</button>
      </div>
    )
  }

  const dir = order.dir_snapshot ?? {}

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/pedidos')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">{order.numero}</h1>
          <p className="page-subtitle">{formatDate(order.creado_en)}</p>
        </div>
        <Badge variant={BADGE_MAP[order.estado]} className="ml-auto">
          {ESTADO_LABEL[order.estado] ?? order.estado}
        </Badge>
      </div>

      {/* Alerta de stock insuficiente al confirmar el pago */}
      {order.alerta_stock && (
        <div className="section-card p-4 border-l-4 border-red-500 bg-red-50 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">Faltante de stock sin resolver</p>
            <p className="text-xs text-red-600 mt-0.5">
              El pago de este pedido ya fue aprobado, pero al confirmarlo no había stock suficiente
              para uno o más productos (marcados abajo). Contacta al cliente, reabastece o gestiona
              un reembolso parcial, y luego marca la alerta como resuelta para poder prepararlo.
            </p>
            <button
              onClick={handleResolverAlerta}
              disabled={resolving}
              className="btn-danger text-xs mt-3"
            >
              {resolving ? 'Guardando…' : 'Marcar como resuelto'}
            </button>
          </div>
        </div>
      )}

      {/* Link de seguimiento del envío (Coordinadora, Servientrega, etc.) */}
      {order.estado !== 'pendiente_pago' && (
        <div className="section-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-black flex items-center gap-1.5">
              <Link2 size={15} /> Link de seguimiento
            </h2>
            {order.confirmado_cliente_en ? (
              <span className="text-xs font-semibold text-green-600">
                Cliente confirmó recibido — {formatDate(order.confirmado_cliente_en)}
              </span>
            ) : (
              <span className="text-xs text-gray-400">El cliente aún no confirmó recibido</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={handleGuardarLink}
              disabled={savingLink}
              className="btn-primary text-xs px-4"
            >
              {savingLink ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
          {linkError && <p className="text-xs text-red-500">{linkError}</p>}
          {order.link_seguimiento && (
            <a
              href={order.link_seguimiento}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-admin-accent hover:underline"
            >
              Abrir link actual →
            </a>
          )}
        </div>
      )}

      {/* Info del cliente */}
      <div className="section-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-black">Destinatario</h2>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-violet-950 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {order.cliente_nombre?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-black">
              {dir.nombre_destinatario ?? order.cliente_nombre}
            </p>
            <p className="text-xs text-gray-400">{order.cliente_email}</p>
            {dir.direccion && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={12} />
                {dir.direccion}{dir.ciudad ? `, ${dir.ciudad}` : ''}{dir.departamento ? ` (${dir.departamento})` : ''}
              </div>
            )}
            {dir.telefono && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <CreditCard size={12} /> {dir.telefono}
              </div>
            )}
          </div>
        </div>
        {order.notas && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-semibold">Nota:</span> {order.notas}
          </p>
        )}
      </div>

      {/* Items del pedido */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-bold text-black">Productos del pedido</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {(order.items ?? []).map((item) => {
            // variantes_snap es objeto arbitrario: {Talla: "40", Color: "Negro", ...}
            const variantesTexto = Object.entries(item.variantes_snap ?? {})
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')

            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                {item.imagen_snap ? (
                  <img src={item.imagen_snap} alt={item.nombre_snap}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-black flex items-center gap-1.5">
                    {item.nombre_snap}
                    {item.stock_insuficiente && (
                      <AlertTriangle size={13} className="text-red-500 flex-shrink-0" title="Sin stock suficiente al confirmar el pago" />
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {variantesTexto && `${variantesTexto} · `}Cant: {item.cantidad}
                  </p>
                  {item.stock_insuficiente && (
                    <p className="text-xs text-red-500 font-medium">Sin stock suficiente</p>
                  )}
                  {item.descuento_unitario > 0 && (
                    <p className="text-xs text-admin-accent">Descuento: -{formatCurrency(item.descuento_unitario)}</p>
                  )}
                </div>
                <p className="text-sm font-bold text-black">{formatCurrency(item.subtotal)}</p>
              </div>
            )
          })}
        </div>

        {/* Resumen de precios */}
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          <div className="flex justify-between px-5 py-2.5 text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.descuento > 0 && (
            <div className="flex justify-between px-5 py-2.5 text-sm text-admin-accent">
              <span>Descuento</span>
              <span>-{formatCurrency(order.descuento)}</span>
            </div>
          )}
          <div className="flex justify-between px-5 py-2.5 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Truck size={13} /> Envío</span>
            <span>{order.envio === 0 ? 'Gratis' : formatCurrency(order.envio)}</span>
          </div>
          <div className="flex justify-between items-center px-5 py-4 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Total del pedido</span>
            <span className="text-lg font-black text-black">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
