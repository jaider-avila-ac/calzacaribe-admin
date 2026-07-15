import { useEffect, useState } from 'react'
import { CreditCard, Mail, Moon, Pencil, Plus, Save, Store, Sun, Phone, MapPin, Trash2, Undo2 } from 'lucide-react'
import Input from '../../../components/ui/Input'
import { getTheme, setTheme as saveTheme } from '../../../services/themeService'
import { tiendaConfigService } from '../../../services/tiendaConfigService'
import { direccionDevolucionService } from '../../../services/direccionDevolucionService'

const DIRECCION_DEVOLUCION_VACIA = {
  nombre: '', direccion: '', complemento: '', departamento: '', municipio: '', barrio: '',
  contactoNombre: '', contactoTelefono: '',
}

function DireccionesDevolucionSection() {
  const [direcciones, setDirecciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null) // id, o 'nueva'
  const [form, setForm] = useState(DIRECCION_DEVOLUCION_VACIA)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    direccionDevolucionService.getAll()
      .then((data) => setDirecciones(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const iniciarEdicion = (dir) => {
    setForm(dir ? {
      nombre: dir.nombre, direccion: dir.direccion, complemento: dir.complemento ?? '',
      departamento: dir.departamento, municipio: dir.municipio, barrio: dir.barrio ?? '',
      contactoNombre: dir.contacto_nombre ?? '', contactoTelefono: dir.contacto_telefono ?? '',
    } : DIRECCION_DEVOLUCION_VACIA)
    setEditando(dir ? dir.id : 'nueva')
    setError('')
  }

  const guardar = async () => {
    if (!form.nombre.trim() || !form.direccion.trim() || !form.departamento.trim() || !form.municipio.trim()) {
      setError('Nombre, dirección, departamento y municipio son obligatorios')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editando === 'nueva') {
        await direccionDevolucionService.create(form)
      } else {
        await direccionDevolucionService.update(editando, form)
      }
      setEditando(null)
      load()
    } catch (err) {
      setError(err.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (dir) => {
    try {
      await direccionDevolucionService.update(dir.id, { activo: !dir.activo })
      load()
    } catch (err) {
      setError(err.message || 'No se pudo actualizar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta dirección de devolución?')) return
    try {
      await direccionDevolucionService.remove(id)
      load()
    } catch (err) {
      setError(err.message || 'No se pudo eliminar')
    }
  }

  return (
    <div className="section-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-500" />
          <h2 className="text-sm font-bold text-black">Direcciones de devolución</h2>
        </div>
        {editando === null && (
          <button type="button" onClick={() => iniciarEdicion(null)} className="btn-secondary text-xs">
            <Plus size={13} /> Agregar
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        A dónde le indicas al cliente que envíe un producto cuando apruebas su devolución. Puedes tener varias (ej. distintas sedes/bodegas).
      </p>

      {loading ? (
        <p className="text-xs text-gray-400">Cargando...</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {direcciones.map((dir) => (
            <div key={dir.id} className="py-3">
              {editando === dir.id ? (
                <DireccionDevolucionForm form={form} set={set} error={error} saving={saving}
                  onGuardar={guardar} onCancelar={() => setEditando(null)} />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className={dir.activo ? '' : 'opacity-50'}>
                    <p className="text-sm font-semibold text-black">{dir.nombre}</p>
                    <p className="text-xs text-gray-500">{dir.direccion}{dir.complemento ? `, ${dir.complemento}` : ''}</p>
                    <p className="text-xs text-gray-400">{[dir.barrio, dir.municipio, dir.departamento].filter(Boolean).join(', ')}</p>
                    {!dir.activo && <p className="text-xs text-red-500 mt-0.5">Inactiva</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button type="button" onClick={() => toggleActivo(dir)} className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-black" title={dir.activo ? 'Desactivar' : 'Activar'}>
                      <Undo2 size={14} />
                    </button>
                    <button type="button" onClick={() => iniciarEdicion(dir)} className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-black" title="Editar">
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => eliminar(dir.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {editando === 'nueva' && (
            <div className="py-3">
              <DireccionDevolucionForm form={form} set={set} error={error} saving={saving}
                onGuardar={guardar} onCancelar={() => setEditando(null)} />
            </div>
          )}
          {direcciones.length === 0 && editando === null && (
            <p className="text-xs text-gray-400 py-2">Aún no has agregado ninguna dirección de devolución.</p>
          )}
        </div>
      )}
    </div>
  )
}

function DireccionDevolucionForm({ form, set, error, saving, onGuardar, onCancelar }) {
  return (
    <div className="space-y-3 bg-gray-50 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Nombre (ej. Bodega principal)" value={form.nombre} onChange={set('nombre')} />
        <Input label="Dirección" value={form.direccion} onChange={set('direccion')} />
        <Input label="Complemento (opcional)" value={form.complemento} onChange={set('complemento')} />
        <Input label="Barrio (opcional)" value={form.barrio} onChange={set('barrio')} />
        <Input label="Departamento" value={form.departamento} onChange={set('departamento')} />
        <Input label="Municipio" value={form.municipio} onChange={set('municipio')} />
        <Input label="Nombre de contacto (opcional)" value={form.contactoNombre} onChange={set('contactoNombre')} />
        <Input label="Teléfono de contacto (opcional)" value={form.contactoTelefono} onChange={set('contactoTelefono')} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="button" onClick={onGuardar} disabled={saving} className="btn-primary text-xs">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancelar} className="text-xs text-gray-400 hover:text-black">Cancelar</button>
      </div>
    </div>
  )
}

const INITIAL = {
  nombre: 'Calzacaribe',
  nit: '900.123.456-7',
  email: 'ventas@calzacaribe.co',
  telefono: '315-555-0001',
  ciudad: 'Barranquilla',
  direccion: 'Cra 54 # 72-150, Piso 2',
  sitioWeb: 'www.calzacaribe.co',
  moneda: 'COP',
  whatsapp: '3155550001',
}

export default function SettingsPage() {
  const [form, setForm] = useState(INITIAL)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState(() => getTheme())

  const [envioGratisActivo, setEnvioGratisActivo] = useState(false)
  const [envioGratisDesde, setEnvioGratisDesde] = useState('')
  const [envioCosto, setEnvioCosto] = useState('')
  const [dominioStaff, setDominioStaff] = useState('')
  const [emailNotificacionPedidos, setEmailNotificacionPedidos] = useState('')
  const [envioConfigLoaded, setEnvioConfigLoaded] = useState(false)

  useEffect(() => {
    tiendaConfigService.get()
      .then((cfg) => {
        setEnvioGratisActivo(Boolean(cfg?.envio_gratis_activo))
        setEnvioGratisDesde(cfg?.envio_gratis_desde != null ? String(cfg.envio_gratis_desde) : '')
        setEnvioCosto(cfg?.envio_costo != null ? String(cfg.envio_costo) : '')
        setDominioStaff(cfg?.dominio_staff ?? '')
        setEmailNotificacionPedidos(cfg?.email_notificacion_pedidos ?? '')
        setEnvioConfigLoaded(true)
      })
      .catch(() => {})
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const isDark = theme === 'dark'

  const toggleTheme = () => {
    setTheme(saveTheme(isDark ? 'light' : 'dark'))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await tiendaConfigService.update({
        envioGratisActivo,
        envioGratisDesde: Number(envioGratisDesde) || 0,
        envioCosto: Number(envioCosto) || 0,
        dominioStaff,
        emailNotificacionPedidos,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Apariencia */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {isDark ? <Moon size={16} className="text-gray-500" /> : <Sun size={16} className="text-gray-500" />}
              <div>
                <h2 className="text-sm font-bold text-black">Apariencia</h2>
                <p className="text-xs text-gray-400 mt-0.5">Activa o desactiva el modo oscuro del panel admin.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative h-7 w-14 transition-colors flex-shrink-0 ${isDark ? 'bg-admin-accent' : 'bg-gray-200'}`}
              aria-pressed={isDark}
              aria-label="Cambiar modo oscuro"
            >
              <span className={`absolute top-1 h-5 w-5 bg-white shadow-sm transition-transform ${isDark ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Info de la tienda */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Información de la tienda</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre de la tienda" value={form.nombre} onChange={set('nombre')} />
            <Input label="NIT / RUT" value={form.nit} onChange={set('nit')} />
          </div>
          <div className="pt-2 border-t border-gray-100">
            <Input
              label="Dominio para colaboradores"
              value={dominioStaff}
              onChange={(e) => setDominioStaff(e.target.value)}
              placeholder="tuempresa.com"
            />
            <p className="text-xs text-gray-400 mt-1">
              Los colaboradores que crees en "Colaboradores" recibirán un usuario con este dominio (ej. juan.perez@{dominioStaff || 'tuempresa.com'}).
            </p>
          </div>
        </div>

        {/* Contacto */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Phone size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Contacto</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email de ventas" type="email" value={form.email} onChange={set('email')} />
            <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} />
            <Input label="WhatsApp (solo números)" value={form.whatsapp} onChange={set('whatsapp')} />
            <Input label="Sitio web" value={form.sitioWeb} onChange={set('sitioWeb')} />
          </div>
        </div>

        {/* Ubicación */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Ubicación</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Ciudad" value={form.ciudad} onChange={set('ciudad')} />
            <Input label="Dirección" value={form.direccion} onChange={set('direccion')} />
          </div>
        </div>

        <DireccionesDevolucionSection />

        {/* Envíos y pagos */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <CreditCard size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Envíos y pagos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Moneda</label>
              <select value={form.moneda} onChange={set('moneda')} className="input-field bg-white">
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar</option>
              </select>
            </div>
            <Input
              label="Costo de envío base (COP)"
              type="number"
              value={envioCosto}
              onChange={(e) => setEnvioCosto(e.target.value)}
              disabled={!envioConfigLoaded}
              placeholder={envioConfigLoaded ? '' : 'Cargando...'}
            />
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-black">Envío gratis por monto mínimo</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Muestra la barra de progreso "te faltan $X para envío gratis" en la tienda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnvioGratisActivo((v) => !v)}
                disabled={!envioConfigLoaded}
                className={`relative h-7 w-14 transition-colors flex-shrink-0 disabled:opacity-50 ${envioGratisActivo ? 'bg-admin-accent' : 'bg-gray-200'}`}
                aria-pressed={envioGratisActivo}
                aria-label="Activar envío gratis por monto mínimo"
              >
                <span className={`absolute top-1 h-5 w-5 bg-white shadow-sm transition-transform ${envioGratisActivo ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
            <Input
              label="Compra mín. para envío gratis (COP)"
              type="number"
              value={envioGratisDesde}
              onChange={(e) => setEnvioGratisDesde(e.target.value)}
              placeholder={envioConfigLoaded ? '' : 'Cargando...'}
              disabled={!envioGratisActivo}
              className={!envioGratisActivo ? 'opacity-50' : ''}
            />
          </div>
        </div>

        {/* Notificaciones por correo */}
        <div className="section-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Mail size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-black">Notificaciones por correo</h2>
          </div>
          <div>
            <Input
              label="Correo para avisos de nuevos pedidos"
              type="email"
              value={emailNotificacionPedidos}
              onChange={(e) => setEmailNotificacionPedidos(e.target.value)}
              disabled={!envioConfigLoaded}
              placeholder={envioConfigLoaded ? 'ej. ventas@tuempresa.com' : 'Cargando...'}
            />
            <p className="text-xs text-gray-400 mt-1">
              Cada vez que un cliente pague un pedido, llega un correo a esta dirección además de la
              notificación dentro del panel. Déjalo vacío para no recibir correos.
            </p>
          </div>
        </div>

        {/* Zona peligrosa */}
        <div className="section-card p-5 border-l-4 border-red-500">
          <h2 className="text-sm font-bold text-red-600 mb-1">Zona de riesgo</h2>
          <p className="text-xs text-gray-500 mb-3">Estas acciones son irreversibles. Úsalas con cuidado.</p>
          <button type="button" onClick={() => confirm('¿Resetear todos los datos al estado inicial?') && localStorage.clear() && window.location.reload()} className="btn-danger text-xs">
            Resetear todos los datos
          </button>
        </div>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={saving} className={`btn-primary ${saved ? 'bg-admin-accent hover:bg-admin-accent-hover text-admin-accent-contrast' : ''}`}>
            <Save size={15} />
            {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
