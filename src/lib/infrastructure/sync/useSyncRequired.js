import { useState, useEffect } from 'react'
import { Sync } from './Sync'
import { Log } from '../Log'

export const useSyncRequired = () => {
  const [syncRequired, setSyncRequired] = useState(null)

  useEffect(() => {
    Sync.isRequired()
      .catch(e => Log.error(e))
      .then(required => setSyncRequired(required))
  }, [])

  return { syncRequired }
}
