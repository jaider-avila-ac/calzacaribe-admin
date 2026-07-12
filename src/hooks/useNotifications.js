import { useCallback, useEffect, useState } from 'react'
import { notificationService } from '../services/notificationService'
import { connectNotifications, disconnectNotifications } from '../services/notificationSocket'

export function useNotifications() {
  const [items, setItems] = useState([])

  const load = useCallback(() => {
    notificationService.list().then(setItems).catch(() => {})
  }, [])

  useEffect(() => {
    load()
    connectNotifications({
      onNotification: (n) => setItems((prev) => [n, ...prev]),
    })
    return () => disconnectNotifications()
  }, [load])

  const markRead = useCallback((id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
    notificationService.markRead(id).catch(() => {})
  }, [])

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, leida: true })))
    notificationService.markAllRead().catch(() => {})
  }, [])

  const unreadCount = items.filter((n) => !n.leida).length

  return { items, unreadCount, markRead, markAllRead }
}
