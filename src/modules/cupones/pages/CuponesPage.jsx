import { useEffect, useState } from 'react'
import { Plus, X, Check, Shuffle } from 'lucide-react'
import { cuponService } from '../../../services/cuponService'
import Badge from '../../../components/ui/Badge'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import EmptyState from '../../../components/ui/EmptyState'

function emptyForm() {
  return { generarAleatorio: true, codigo: '', tipoDescuento: 'porcentaje', valor: '', maxUsos: '1' }
}

function formatDescuento(c) {
  return c.tipo_descuento === 'porcentaje' ? `${c.valor}%` : `$${Number(c.valor).toLocaleString('es-CO')}`
}

export default function CuponesPage() {
  const [cupones, setCupones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  // Se muestra una sola vez justo al crear uno aleatorio — después el código ya quedó visible
  // en la lista de todos modos, esto es solo para que no haya que ir a buscarlo.
  const [codigoRecienCreado, setCodigoRecienCreado] = useState(null)

  const load = () => {
    setLoading(true)
    cuponService.getAll().then(setCupones).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const openCreate = () => { setForm(emptyForm()); setError(''); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.generarAleatorio && !form.codigo.trim()) {
      setError('Escribe un código o marca "Generar código aleatorio"')
      return
    }
    if (!form.valor || Number(form.valor) <= 0) {
      setError('El valor del descuento debe ser mayor a 0')
      return
    }
    setSaving(true)
    try {
      // El backend serializa/espera snake_case (spring.jackson.property-naming-strategy=SNAKE_CASE)
      // — las claves del body tienen que ser estas, no las camelCase que usa el estado del form.
      const creado = await cuponService.create({
        codigo: form.generarAleatorio ? null : form.codigo.trim(),
        generar_aleatorio: form.generarAleatorio,
        tipo_descuento: form.tipoDescuento,
        valor: Number(form.valor),
        max_usos: form.maxUsos ? Number(form.maxUsos) : 1,
      })
      closeModal()
      if (form.generarAleatorio) setCodigoRecienCreado(creado.codigo)
      load()
    } catch (err) {
      setError(err.message || 'No se pudo crear el cupón')
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (c) => {
    await cuponService.cambiarActivo(c.id, !c.activo)
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Cargando cupones…</div>
  )

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Cupones</h1>
          <p className="page-subtitle">Bonos de descuento que el cliente aplica en el carrito antes de pagar.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={15} /> Nuevo cupón</button>
      </div>

      {codigoRecienCreado && (
        <div className="section-card p-4 border-l-4 border-green-500 bg-green-50 flex items-center justify-between gap-3">
          <p className="text-sm text-green-800">
            Código generado: <span className="font-mono font-bold">{codigoRecienCreado}</span>
          </p>
          <button onClick={() => setCodigoRecienCreado(null)} className="text-green-700 hover:text-green-900">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="section-card">
        {cupones.length === 0 ? (
          <EmptyState title="Sin cupones"
            description="Crea el primer cupón — código aleatorio o uno que escribas tú, de un solo uso o con un límite de usos."
            action={<button onClick={openCreate} className="btn-primary">Crear cupón</button>} />
        ) : (
          <div className="divide-y divide-gray-50">
            {cupones.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-black font-mono">{c.codigo}</p>
                  <p className="text-xs text-gray-400">
                    {formatDescuento(c)} de descuento · {c.usos_actuales}/{c.max_usos} usos
                  </p>
                </div>
                <Badge variant={c.activo ? 'success' : 'danger'}>{c.activo ? 'Activo' : 'Inactivo'}</Badge>
                <button
                  onClick={() => toggleActivo(c)}
                  className="text-xs font-semibold text-gray-500 hover:text-black transition-colors px-2 py-1"
                >
                  {c.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear */}
      <Modal open={modalOpen} onClose={closeModal} title="Nuevo cupón" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1.5"><Shuffle size={14} /> Generar código aleatorio</span>
            <button type="button" onClick={() => setForm((f) => ({ ...f, generarAleatorio: !f.generarAleatorio }))}
              className={`relative inline-flex h-6 w-11 items-center transition-colors ${form.generarAleatorio ? 'bg-black' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform bg-white transition-transform ${form.generarAleatorio ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {!form.generarAleatorio && (
            <Input label="Código personalizado" value={form.codigo} onChange={set('codigo')} placeholder="VERANO20" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">Tipo de descuento</label>
              <select value={form.tipoDescuento} onChange={set('tipoDescuento')} className="input-field bg-white">
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="fijo">Monto fijo (COP)</option>
              </select>
            </div>
            <Input
              label={form.tipoDescuento === 'porcentaje' ? 'Porcentaje (1-100)' : 'Monto (COP)'}
              type="number" value={form.valor} onChange={set('valor')}
              placeholder={form.tipoDescuento === 'porcentaje' ? '20' : '20000'}
            />
          </div>

          <Input label="Límite de usos (1 = un solo uso)" type="number" min="1" value={form.maxUsos} onChange={set('maxUsos')} />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="btn-secondary"><X size={14} /> Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              <Check size={14} /> {saving ? 'Guardando…' : 'Crear cupón'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
