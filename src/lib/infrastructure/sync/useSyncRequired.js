import { useState, useEffect } from 'react'
import { Sync } from './Sync'
import { Log } from '../Log'

export const useSyncRequired = ({ userToken }) => {
  const [syncRequired, setSyncRequired] = useState(null)

  useEffect(() => {
    if (!userToken) { return }

    Sync.isRequired()
      .catch(e => Log.error(e))
      .then(required => setSyncRequired(required))
  }, [userToken])

  return { syncRequired }
}
