import { useState, useEffect } from 'react'
import { Sync } from '../infrastructure/sync/Sync'
import { Log } from '../infrastructure/Log'
import { asyncTimeout } from '../utils/asyncTimeout'
import { ErrorReporter } from '../errors/ErrorReporter'

const debug = Log.create('useSync', 'debug')

// FIXME move to hooks folder!

export const useSync = () => {
  const [syncRequired, setSyncRequired] = useState(false)
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const syncHandler = async () => {
      const isRequired = await Sync.isRequired()
      debug({ isRequired })

      if (isRequired) {
        setSyncRequired(true)

        const onProgress = (data) => {
          debug('progress', data)
          setProgress(data.progress)
        }
        debug('run sync', Sync.getQueue())
        try {
          await Sync.run({ onProgress })
        }
        catch (e) {
          Log.error(e)
          ErrorReporter
            .send({ error: e })
            .catch(Log.error)
        }
        finally {
          debug('sync complete')
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
