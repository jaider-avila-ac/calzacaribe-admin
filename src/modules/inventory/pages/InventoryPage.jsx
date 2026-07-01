import { useState } from 'react'
import { AlertTriangle, Edit2, Check, X, Search } from 'lucide-react'
import { useInventory } from '../hooks/useInventory'
import Badge from '../../../components/ui/Badge'

function StockStatus({ estadoStock }) {
  if (estadoStock === 'agotado') return <Badge variant="danger"><AlertTriangle size={10} className="mr-1 inline" />Agotado</Badge>
  if (estadoStock === 'bajo')    return <Badge variant="warning">Stock bajo</Badge>
  return <Badge variant="success">Disponible</Badge>
}

export default function InventoryPage() {
  const { items, resumen, loading, updateStock } = useInventory()
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [search,  setSearch]  = useState('')

  const filtered = items.filter((it) =>
    (it.nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (it.talla  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (it.color  ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const startEdit   = (item) => { setEditing(item.var_id); setEditVal(String(item.stock)) }
  const confirmEdit = (item) => {
    const val = Number(editVal)
    if (!isNaN(val) && val >= 0) updateStock(item.var_id, val)
    setEditing(null)
  }
  const cancelEdit = () => setEditing(null)

  return (
    <div className="space-y-4">
      {/* Stats — vienen del backend */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total en stock</p>
          <p className="text-3xl font-black text-black mt-1">{resumen?.total_stock ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">unidades (variantes activas)</p>
        </div>
        <div className="stat-card text-center border-l-4 border-yellow-400">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock bajo</p>
          <p className="text-3xl font-black text-yellow-600 mt-1">{resumen?.bajo_stock ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">variantes con stock ≤ 5</p>
        </div>
        <div className="stat-card text-center border-l-4 border-red-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sin stock</p>
          <p className="text-3xl font-black text-red-600 mt-1">{resumen?.agotadas ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">variantes agotadas</p>
        </div>
      </div>

      {/* Search */}
      <div className="section-card px-5 py-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Buscar por producto, talla o color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 input-field text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="section-card">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-black">Control de inventario por variante</h2>
          <p className="text-xs text-gray-400">Haz clic en el ícono de edición para modificar el stock</p>
        </div>
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header px-5 py-3 text-left">Producto</th>
                <th className="table-header px-4 py-3 text-left">Talla</th>
                <th className="table-header px-4 py-3 text-left">Color</th>
                <th className="table-header px-4 py-3 text-left">Marca</th>
                <th className="table-header px-4 py-3 text-center">Stock actual</th>
                <th className="table-header px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr
                  key={item.var_id}
                  className={`hover:bg-gray-50 transition-colors ${
                    item.estado_stock === 'agotado' ? 'bg-red-50/30' :
                    item.estado_stock === 'bajo'    ? 'bg-yellow-50/30' : ''
                  }`}
                >
                  <td className="table-cell px-5">
                    <p className="font-semibold text-black text-sm">{item.nombre}</p>
                  </td>
                  <td className="table-cell px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-gray-100 text-xs font-bold text-black">
                      {item.talla}
                    </span>
                  </td>
                  <td className="table-cell px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                        style={{ backgroundColor: item.color_hex }}
                      />
                      <span className="text-sm text-gray-600">{item.color}</span>
                    </div>
                  </td>
                  <td className="table-cell px-4 text-gray-500">{item.marca ?? '-'}</td>
                  <td className="table-cell px-4 text-center">
                    {editing === item.var_id ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="w-20 text-center border border-black rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
                          autoFocus
                          min={0}
                        />
                        <button onClick={() => confirmEdit(item)} className="p-1 rounded-lg bg-lime-300 text-black hover:bg-lime-400 transition-colors">
                          <Check size={14} />
                        </button>
                        <button onClick={cancelEdit} className="p-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-lg font-black ${
                          item.estado_stock === 'agotado' ? 'text-red-600' :
                          item.estado_stock === 'bajo'    ? 'text-yellow-600' : 'text-black'
                        }`}>
                          {item.stock}
                        </span>
                        <button onClick={() => startEdit(item)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-colors">
                          <Edit2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="table-cell px-4 text-center">
                    <StockStatus estadoStock={item.estado_stock} />
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
