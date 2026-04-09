import { useEffect, useState } from 'react'

/** Fuerza re-render cada `intervalMs` (p. ej. para recalcular abierto/cerrado). */
export function useNowTick(intervalMs = 45000) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}
