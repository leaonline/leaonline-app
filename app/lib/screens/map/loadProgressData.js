import { Log } from '../../infrastructure/Log'
import { callMeteor } from '../../meteor/call'
import { Config } from '../../env/Config'

const debug = Log.create('loadProgressDoc', 'debug')

export const loadProgressDoc = async (fieldId) => {
  debug('for', { fieldId })
  const progressDoc = await callMeteor({
    name: Config.methods.getProgress,
    args: { fieldId },
    failure: error => Log.error(error)
  })

  // if there is no progress for this field yet
  if (!progressDoc) {
    debug('no progress doc for', { fieldId })
    return null
  }

  // make the list a "dict" style object for fast access
  const unitSets = {}

  progressDoc.unitSets.forEach(entry => {
    unitSets[entry._id] = entry
  })

  progressDoc.unitSets = unitSets

  debug('loaded')
  return progressDoc
}
