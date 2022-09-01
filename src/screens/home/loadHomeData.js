import { Field } from '../../contexts/Field'
import { Dimension } from '../../contexts/Dimension'
import { Level } from '../../contexts/Level'
import { Sync } from '../../infrastructure/sync/Sync'
import { Log } from '../../infrastructure/Log'
import { callMeteor } from '../../meteor/call'

export const loadHomeData = async () => {
  // TODO if not connected return what's available locally
  // and re-run once connected again
  try {
    console.debug('field', fallback())
    const toSync = await Sync.compare([Field, Dimension, Level])
    console.debug({ toSync })

    // if nothing to sync we return what's currently in
    // the Field collection
    if (toSync.length === 0) { return fallback() }

    const args = {}

    toSync.forEach(({ name }) => {
      args[name] = true
    })

    const homeData = await callMeteor({ name: 'content.methods.home', args })
    console.debug({ homeData })
    if (!homeData) { return fallback() }

    for (const { name, newHash } of toSync) {
      const docs = homeData[name]
      await Sync.updateCollection({ docs, name, newHash })
    }
    return fallback()
  } catch (e) {
    Log.warn('loadHomeData failed', e.message)
    return fallback()
  }
}

const fallback = () => Field.collection().find().fetch()
