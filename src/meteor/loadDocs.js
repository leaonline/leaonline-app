import { useEffect, useState } from 'react'
import { Log } from '../infrastructure/Log'

const debug = Log.create('loadDocs', 'debug')

export const loadDocs = (fn, { runArgs = [] } = {}) => {
  const [data, setData] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    debug('run fn() to load data')

    // this is a self-executing async function, which is required
    // since the last react update to prevent "destroy() is undefined" error
    ;(async function load () {
      try {
        const data = await fn()
        setData(data)
      } catch (e) {
        debug('fn resulted in error', e.message)
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, runArgs)

  return { data, error, loading }
}
