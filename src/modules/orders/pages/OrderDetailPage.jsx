import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, CreditCard, Package, Truck, AlertTriangle, Link2, Ban, History } from 'lucide-react'
import { orderService, ESTADOS_PEDIDO, MOTIVOS_CANCELACION } from '../../../services/orderService'
import { reembolsoService } from '../../../services/reembolsoService'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import { formatCurrency, formatDate } from '../../../utils/format'

const REEMBOLSO_BADGE = { pendiente: 'warning', en_proceso: 'info', completado: 'success', rechazado: 'danger', error: 'danger' }
const REEMBOLSO_LABEL = { pendiente: 'Pendiente', en_proceso: 'En proceso', completado: 'Completado', rechazado: 'Rechazado', error: 'Error' }
const METODO_PAGO_LABEL = { CARD: 'Tarjeta', NEQUI: 'Nequi', PSE: 'PSE', BANCOLOMBIA_TRANSFER: 'Transferencia Bancolombia', EFECTIVO: 'Efectivo', OTRO: 'Otro' }

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

// Lista fija de transportadoras — el backend solo guarda el texto, no valida contra esto.
const TRANSPORTADORAS = ['Envía', 'Coordinadora', 'Interrapidísimo', 'Servientrega', 'Otra']

const MOSTRAR_OPCIONES = [
  { value: 'ambos',  label: 'Código y link' },
  { value: 'codigo', label: 'Solo código' },
  { value: 'link',   label: 'Solo link' },
]

const SEGUIMIENTO_VACIO = { transportadora: '', codigoRastreo: '', link: '', mostrar: 'ambos' }

export default function OrderDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [seguimiento, setSeguimiento] = useState(SEGUIMIENTO_VACIO)
  const [savingSeguimiento, setSavingSeguimiento] = useState(false)
  const [seguimientoError, setSeguimientoError] = useState('')
  const [savingEstado, setSavingEstado] = useState(false)
  const [estadoError, setEstadoError] = useState('')

  const [historial, setHistorial] = useState([])
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelMotivo, setCancelMotivo] = useState('')
  const [cancelMotivoOtro, setCancelMotivoOtro] = useState('')
  const [cancelNota, setCancelNota] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [reembolsoNota, setReembolsoNota] = useState('')
  const [reembolsoLoading, setReembolsoLoading] = useState(false)
  const [reembolsoError, setReembolsoError] = useState('')

  const load = () => {
    setLoading(true)
    orderService.getById(id)
      .then((data) => {
        setOrder(data)
        setSeguimiento({
          transportadora: data.transportadora ?? '',
          codigoRastreo: data.codigo_rastreo ?? '',
          link: data.link_seguimiento ?? '',
          mostrar: data.mostrar_seguimiento ?? 'ambos',
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
    orderService.getHistorial(id).then(setHistorial).catch(() => setHistorial([]))
  }

  useEffect(load, [id])

  const puedeCancelar = order && !['cancelado', 'devuelto', 'entregado'].includes(order.estado)

  const abrirCancelar = () => {
    setCancelMotivo('')
    setCancelMotivoOtro('')
    setCancelNota('')
    setCancelError('')
    setCancelOpen(true)
  }

  const handleCancelar = async () => {
    if (!cancelMotivo) { setCancelError('Selecciona un motivo'); return }
    if (cancelMotivo === 'otro' && !cancelMotivoOtro.trim()) {
      setCancelError('Explica el motivo en el campo de abajo'); return
    }
    setCancelLoading(true)
    setCancelError('')
    try {
      await orderService.cancelar(id, { motivo: cancelMotivo, motivoOtro: cancelMotivoOtro.trim() || null, nota: cancelNota.trim() || null })
      setCancelOpen(false)
      load()
    } catch (err) {
      setCancelError(err.message || 'No se pudo cancelar la compra')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleConfirmarReembolso = async (estado) => {
    setReembolsoLoading(true)
    setReembolsoError('')
    try {
      await reembolsoService.confirmar(order.reembolso.id, estado, reembolsoNota.trim() || null)
      setReembolsoNota('')
      load()
    } catch (err) {
      setReembolsoError(err.message || 'No se pudo confirmar el reembolso')
    } finally {
      setReembolsoLoading(false)
    }
  }

  const handleCambiarEstado = async (e) => {
    const nuevoEstado = e.target.value
    if (nuevoEstado === order.estado) return
    setSavingEstado(true)
    setEstadoError('')
    try {
      await orderService.updateEstado(id, nuevoEstado)
      load()
    } catch (err) {
      setEstadoError(err.message || 'No se pudo cambiar el estado')
    } finally {
      setSavingEstado(false)
    }
  }

  const handleResolverAlerta = async () => {
    setResolving(true)
    try {
      await orderService.resolverAlertaStock(id)
      load()
    } finally {
      setResolving(false)
    }
  }

  const setSeguimientoField = (field) => (e) =>
    setSeguimiento((prev) => ({ ...prev, [field]: e.target.value }))

  const handleGuardarSeguimiento = async () => {
    setSavingSeguimiento(true)
    setSeguimientoError('')
    try {
      await orderService.updateSeguimiento(id, {
        transportadora: seguimiento.transportadora.trim(),
        codigoRastreo: seguimiento.codigoRastreo.trim(),
        link: seguimiento.link.trim(),
        mostrar: seguimiento.mostrar,
      })
      load()
    } catch (err) {
      setSeguimientoError(err.message || 'No se pudo guardar')
    } finally {
      setSavingSeguimiento(false)
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
        <button onClick={() => navigate('/pedidos')} className="p-2 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">{order.numero}</h1>
          <p className="page-subtitle">{formatDate(order.creado_en)}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          {order.estado === 'pendiente_pago' ? (
            <Badge variant={BADGE_MAP[order.estado]}>{ESTADO_LABEL[order.estado]}</Badge>
          ) : (
            <select
              value={order.estado}
              onChange={handleCambiarEstado}
              disabled={savingEstado}
              className={`text-xs font-bold border-0 px-3 py-1.5 cursor-pointer disabled:opacity-60 ${BADGE_MAP[order.estado] === 'success' ? 'bg-green-100 text-green-700' : BADGE_MAP[order.estado] === 'danger' ? 'bg-red-100 text-red-600' : BADGE_MAP[order.estado] === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-gray-800 text-white'}`}
            >
              {ESTADOS_PEDIDO.map((e) => (
                <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
              ))}
            </select>
          )}
          {estadoError && <span className="text-[11px] text-red-500">{estadoError}</span>}
          {puedeCancelar && (
            <button onClick={abrirCancelar} className="text-[11px] font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 mt-1">
              <Ban size={12} /> Cancelar compra y reembolsar
            </button>
          )}
        </div>
      </div>

      {/* Cancelación por el admin — motivo, nota y estado del reembolso */}
      {order.cancel_motivo && (
        <div className="section-card p-4 border-l-4 border-red-500 bg-red-50 space-y-2">
          <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
            <Ban size={15} /> Compra cancelada por la tienda
          </p>
          <p className="text-xs text-red-600">
            <span className="font-semibold">Motivo:</span> {MOTIVOS_CANCELACION.find((m) => m.value === order.cancel_motivo)?.label ?? order.cancel_motivo}
            {order.cancel_motivo_otro && ` — ${order.cancel_motivo_otro}`}
          </p>
          {order.cancel_nota && (
            <p className="text-xs text-red-600"><span className="font-semibold">Nota:</span> {order.cancel_nota}</p>
          )}
          <p className="text-xs text-red-500">Cancelada el {formatDate(order.cancelado_en)}</p>

          {order.reembolso && (
            <div className="pt-2 border-t border-red-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-700">Reembolso:</span>
                <Badge variant={REEMBOLSO_BADGE[order.reembolso.estado]}>{REEMBOLSO_LABEL[order.reembolso.estado]}</Badge>
                <span className="text-xs text-red-600">{formatCurrency(order.reembolso.monto_centavos / 100)}</span>
                {order.metodo_pago && <span className="text-xs text-red-500">— {METODO_PAGO_LABEL[order.metodo_pago] ?? order.metodo_pago}</span>}
              </div>
              {order.reembolso.error_mensaje && (
                <p className="text-xs text-red-500">{order.reembolso.error_mensaje}</p>
              )}
              {['pendiente', 'en_proceso'].includes(order.reembolso.estado) && (
                <div className="space-y-1.5">
                  <textarea value={reembolsoNota} onChange={(e) => setReembolsoNota(e.target.value)} rows={2}
                    className="input-field bg-white resize-none text-xs" placeholder="Nota (ej. confirmado por transferencia Bancolombia el...)" />
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleConfirmarReembolso('completado')} disabled={reembolsoLoading} className="btn-primary text-xs">
                      {reembolsoLoading ? 'Guardando...' : 'Marcar reembolso completado'}
                    </button>
                    <button onClick={() => handleConfirmarReembolso('error')} disabled={reembolsoLoading} className="btn-danger text-xs">
                      Marcar con error
                    </button>
                  </div>
                  {reembolsoError && <p className="text-xs text-red-500">{reembolsoError}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Historial de estados */}
      {historial.length > 0 && (
        <div className="section-card p-4">
          <h2 className="text-sm font-bold text-black flex items-center gap-1.5 mb-2">
            <History size={15} /> Historial
          </h2>
          <div className="space-y-1.5">
            {historial.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  <span className="font-semibold text-black">{ESTADO_LABEL[h.estado] ?? h.estado}</span>
                  {h.admin && ` — ${h.admin}`}
                  {h.nota && <span className="text-gray-400"> ({h.nota})</span>}
                </span>
                <span className="text-gray-400">{formatDate(h.fecha)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Seguimiento del envío (transportadora, código de rastreo y/o link) */}
      {order.estado !== 'pendiente_pago' && (
        <div className="section-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-black flex items-center gap-1.5">
              <Link2 size={15} /> Seguimiento del envío
            </h2>
            {order.confirmado_cliente_en ? (
              <span className="text-xs font-semibold text-green-600">
                Cliente confirmó recibido — {formatDate(order.confirmado_cliente_en)}
              </span>
            ) : (
              <span className="text-xs text-gray-400">El cliente aún no confirmó recibido</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">Transportadora</label>
              <select
                value={seguimiento.transportadora}
                onChange={setSeguimientoField('transportadora')}
                className="input-field bg-white"
              >
                <option value="">Selecciona...</option>
                {TRANSPORTADORAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Código de rastreo / guía</label>
              <input
                type="text"
                value={seguimiento.codigoRastreo}
                onChange={setSeguimientoField('codigoRastreo')}
                placeholder="Ej: 123456789"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label-field">Link de seguimiento</label>
            <input
              type="text"
              value={seguimiento.link}
              onChange={setSeguimientoField('link')}
              placeholder="https://..."
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">Qué le muestra a la tienda</label>
            <div className="flex gap-4 pt-1">
              {MOSTRAR_OPCIONES.map((op) => (
                <label key={op.value} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="mostrar_seguimiento"
                    value={op.value}
                    checked={seguimiento.mostrar === op.value}
                    onChange={setSeguimientoField('mostrar')}
                    className="accent-black"
                  />
                  {op.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button onClick={handleGuardarSeguimiento} disabled={savingSeguimiento} className="btn-primary text-xs px-4">
              {savingSeguimiento ? 'Guardando…' : 'Guardar'}
            </button>
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
          {seguimientoError && <p className="text-xs text-red-500">{seguimientoError}</p>}
        </div>
      )}

      {/* Info del cliente */}
      <div className="section-card p-5 space-y-3">
        <h2 className="text-sm font-bold text-black">Destinatario</h2>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-violet-950 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
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
          <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2">
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
                    className="w-12 h-12 object-cover bg-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0">
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

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancelar compra y reembolsar" size="md">
        <div className="space-y-3">
          <div>
            <label className="label-field">Motivo de la cancelación</label>
            <select value={cancelMotivo} onChange={(e) => setCancelMotivo(e.target.value)} className="input-field bg-white">
              <option value="">Selecciona un motivo...</option>
              {MOTIVOS_CANCELACION.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {cancelMotivo === 'otro' && (
            <div>
              <label className="label-field">Explica el motivo</label>
              <textarea value={cancelMotivoOtro} onChange={(e) => setCancelMotivoOtro(e.target.value)} rows={2}
                className="input-field bg-white resize-none" placeholder="Describe el motivo de la cancelación..." />
            </div>
          )}

          <div>
            <label className="label-field">Nota adicional para el cliente (opcional)</label>
            <textarea value={cancelNota} onChange={(e) => setCancelNota(e.target.value)} rows={2}
              className="input-field bg-white resize-none" placeholder="Información extra que verá el cliente..." />
          </div>

          <div className="bg-gray-50 p-3 space-y-1 text-xs text-gray-600">
            <p><span className="font-semibold">Total a reembolsar:</span> {formatCurrency(order.total)}</p>
            <p><span className="font-semibold">Método de pago:</span> {order.metodo_pago ? (METODO_PAGO_LABEL[order.metodo_pago] ?? order.metodo_pago) : 'Sin pago registrado'}</p>
            {cancelMotivo && (
              <p><span className="font-semibold">El cliente verá:</span> {MOTIVOS_CANCELACION.find((m) => m.value === cancelMotivo)?.label}{cancelMotivoOtro ? ` — ${cancelMotivoOtro}` : ''}{cancelNota ? `. ${cancelNota}` : ''}</p>
            )}
          </div>

          <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">
            <AlertTriangle size={13} className="flex-shrink-0" />
            Esta acción cancela la compra y no se puede deshacer fácilmente.
          </p>

          {cancelError && <p className="text-xs text-red-500">{cancelError}</p>}

          <button onClick={handleCancelar} disabled={cancelLoading} className="btn-danger text-xs w-full justify-center">
            {cancelLoading ? 'Procesando...' : 'Confirmar cancelación y reembolso'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
