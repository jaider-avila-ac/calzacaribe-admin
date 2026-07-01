import { useState, useEffect, useCallback } from 'react'
import { orderService } from '../../../services/orderService'

export function useOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await orderService.getAll()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateEstado = async (id, estado) => {
    await orderService.updateEstado(id, estado)
    load()
  }

  return { orders, loading, error, reload: load, updateEstado }
}
