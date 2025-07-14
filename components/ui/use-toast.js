'use client'

import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now()
    const newToast = { id, title, description, variant }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toast, dismiss, toasts }
}