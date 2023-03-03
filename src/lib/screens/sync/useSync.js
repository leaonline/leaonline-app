import { useState, useEffect } from 'react'
import { Sync } from '../../infrastructure/sync/Sync'
import { Log } from '../../infrastructure/Log'
import { asyncTimeout } from '../../utils/asyncTimeout'

export const useSync = () => {
  const [syncRequired, setSyncRequired] = useState(false)
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const syncHandler = async () => {
      const isRequired = await Sync.isRequired()

      if (isRequired) {
        setSyncRequired(true)

        const onProgress = (data) => setProgress(data.progress)
        try {
          await Sync.run({ onProgress })
        }
        catch (e) {
          Log.error(e)
        }
        finally {
          setComplete(true)
          await asyncTimeout(500)
          setSyncRequired(false)
        }
      }
    }
    syncHandler().catch(Log.error)
  }, [])

  return { progress, complete, syncRequired }
}
