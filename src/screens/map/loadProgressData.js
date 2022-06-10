import { Log } from '../../infrastructure/Log'
import { callMeteor } from '../../meteor/call'

const methodName = 'progress.methods.get'
const debug = Log.create('loadProgressData', 'debug')

export const loadProgressDoc = async (fieldId) => {
  const progressDoc = await callMeteor({
    name: methodName,
    args: { fieldId },
    failure: error => console.error(error)
  })

  // if there is no progress for this field yet
  if (!progressDoc) { return null }

  // make the list a "dict" style object for fast access
  const unitSets = {}

  progressDoc.unitSets.forEach(entry => {
    unitSets[entry._id] = entry
  })

  progressDoc.unitSets = unitSets

  return progressDoc
}