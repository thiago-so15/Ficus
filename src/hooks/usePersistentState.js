import { useEffect, useState } from 'react'

/**
 * @template T
 * @param {string} key
 * @param {T} initial
 * @returns {[T, import('react').Dispatch<import('react').SetStateAction<T>>]}
 */
export function usePersistentState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return initial
      return JSON.parse(raw)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* ignore quota */
    }
  }, [key, state])

  return [state, setState]
}
