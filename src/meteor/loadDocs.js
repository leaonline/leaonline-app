import { useEffect, useState } from 'react'

export const loadDocs = (fn, { runArgs = [] } = {}) => {
  const [data, setData] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(async () => {
    try {
      const data = await fn()
      setData(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, runArgs)

  return { data, error, loading }
}
