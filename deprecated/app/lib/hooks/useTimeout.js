import { useEffect, useState } from 'react'

export const useTimeout = ({ timeout = 300 }) => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setTimeout(() => setReady(true), timeout)
  }, [])

  return ready
}
