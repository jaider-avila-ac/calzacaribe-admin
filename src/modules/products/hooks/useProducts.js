import { useState, useEffect, useCallback } from 'react'
import { productService } from '../../../services/productService'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getAll()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return {
    products, loading, error, reload: load,
    create: async (data) => { await productService.create(data); load() },
    update: async (id, data) => { await productService.update(id, data); load() },
    remove: async (id) => { await productService.remove(id); load() },
  }
}
