import { useEffect, useState } from 'react'
import { Log } from '../infrastructure/Log'

const debug = Log.create('loadDocs', 'debug')

export const loadDocs = (fn, { runArgs = [] } = {}) => {
  const [data, setData] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(async () => {
    debug('run fn() to load data')
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
