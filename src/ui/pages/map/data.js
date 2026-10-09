import { MapIcons } from '../../../contexts/map/MapIcons'
import { SyncState } from '../../../contexts/sync/SyncState'
import { loadContentDoc } from '../../loading/loadContentDoc'
import { callMethod } from '../../../infrastructure/methods/callMethod'

// MapIcons currently lacks the client isLocal flag present on other reference
// contexts. Configure the existing factory locally without changing the backend.
export const mapIconsContext = { ...MapIcons, isLocal: true }

// MapIcons.get accepts a document ID, not a Field ID. The existing public
// reference-sync endpoint reads the backend snapshot and resolves that mapping.
// Do not call the administrative getAll or fetch live editorial content here.
export const loadMapIcons = async (
  fieldId,
  { call = callMethod, load = loadContentDoc } = {},
) => {
  const documents = await call({
    name: SyncState.methods.getDocs,
    args: { name: MapIcons.name },
  })
  const matches = documents.filter((doc) => doc.fieldId === fieldId)
  if (matches.length !== 1) throw new Error('map.iconsUnavailable')
  const document = await load({
    context: mapIconsContext,
    query: { _id: matches[0]._id },
  })
  if (document?.fieldId !== fieldId || !Array.isArray(document.icons))
    throw new Error('map.iconsUnavailable')
  return document.icons
}
