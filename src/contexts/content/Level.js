import { Level } from 'meteor/leaonline:corelib/contexts/Level'
import { onClientExec } from '../../utils/archUtils'
import { createGetAllMethod } from '../../api/services/createGetAllMethod'

Level.sync = true

onClientExec(() => {
  Level.isLocal = true
})

Level.methods = Level.methods ?? {}
Level.methods.getAll = createGetAllMethod({
  context: Level,
  backendOnly: false,
})

/**
 * See the corelib documentation for further into: {@link https://github.com/leaonline/corelib}
 * @category contexts
 * @namespace
 */
export { Level }
