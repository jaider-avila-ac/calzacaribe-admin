import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { categoryService } from '../../../services/categoryService'
import Badge from '../../../components/ui/Badge'
import EmptyState from '../../../components/ui/EmptyState'
import { formatCurrency } from '../../../utils/format'

const PAGE_SIZE = 20

export default function ProductsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(0)
  const [categories, setCategories] = useState([])
  const [catMap, setCatMap] = useState({})

  useEffect(() => {
    categoryService.getAll().then((data) => {
      const list = Array.isArray(data) ? data : []
      setCategories(list)
      setCatMap(Object.fromEntries(list.map((c) => [c.id, c.nombre])))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(0) }, [debouncedSearch, filterCat, filterStatus])

  const { products, totalElements, totalPages, loading, refreshing, remove } = useProducts({
    page,
    size: PAGE_SIZE,
    catId: filterCat || undefined,
    activo: filterStatus === '' ? undefined : filterStatus === 'activo',
    q: debouncedSearch || undefined,
  })

  const handleDelete = (id, nombre) => {
    if (confirm(`¿Eliminar "${nombre}"?`)) remove(id)
  }

  const from = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const to = page * PAGE_SIZE + products.length

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="section-card px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Buscar por nombre, slug o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 input-field text-sm"
            />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-field w-auto text-sm">
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto text-sm">
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          {refreshing && <span className="text-xs text-gray-400 animate-pulse">Actualizando…</span>}
          <button onClick={() => navigate('/productos/nuevo')} className="btn-primary ml-auto">
            <Plus size={15} /> Nuevo
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="section-card">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando...</div>
        ) : products.length === 0 ? (
          <EmptyState
            title="Sin productos"
            description="No hay productos que coincidan con tu búsqueda."
            action={<button onClick={() => navigate('/productos/nuevo')} className="btn-primary">Crear producto</button>}
          />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header px-5 py-3 text-left">Producto</th>
                <th className="table-header px-4 py-3 text-left">Categoría</th>
                <th className="table-header px-4 py-3 text-left">Variantes</th>
                <th className="table-header px-4 py-3 text-right">Precio</th>
                <th className="table-header px-4 py-3 text-center">Stock total</th>
                <th className="table-header px-4 py-3 text-center">Estado</th>
                <th className="table-header px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const stock = product.stock_total ?? 0
                const imagen = product.imagenes?.[0]?.url
                const marca = product.ficha_tecnica?.marca
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell px-5">
                      <div className="flex items-center gap-3">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={product.nombre}
                            className="w-10 h-10 object-cover bg-gray-100 flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-black text-sm">{product.nombre}</p>
                          {marca && <p className="text-xs text-gray-400">{marca}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell px-4 text-gray-500">{catMap[product.cat_id] ?? '-'}</td>
                    <td className="table-cell px-4 text-gray-500">
                      {(product.variantes ?? []).length} variantes
                    </td>
                    <td className="table-cell px-4 text-right font-semibold text-black">
                      {formatCurrency(product.precio)}
                    </td>
                    <td className="table-cell px-4 text-center">
                      <span className={`text-sm font-bold ${stock === 0 ? 'text-red-600' : stock <= 10 ? 'text-yellow-600' : 'text-black'}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="table-cell px-4 text-center">
                      <Badge variant={product.activo ? 'success' : 'danger'}>
                        {product.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="table-cell px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/productos/${product.id}/editar`)}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.nombre)}
                          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalElements > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Mostrando {from}–{to} de {totalElements} productos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-gray-500">Página {page + 1} de {Math.max(totalPages, 1)}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= totalPages}
              className="p-1.5 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
