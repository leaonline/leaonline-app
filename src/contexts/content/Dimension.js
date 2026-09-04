import { Dimension } from 'meteor/leaonline:corelib/contexts/Dimension'
import { onClientExec } from '../../utils/archUtils'
import { createGetAllMethod } from '../../api/services/createGetAllMethod'
import { createGetMethod } from '../../api/services/createGetMethod'

Dimension.sync = true

onClientExec(() => {
  Dimension.isLocal = true
})

Dimension.methods = Dimension.methods ?? {}
Dimension.methods.getAll = createGetAllMethod({
  context: Dimension,
  backendOnly: false,
})
Dimension.methods.get = createGetMethod({
  context: Dimension,
  backendOnly: false,
})


/**
 * See the corelib documentation for further into: {@link https://github.com/leaonline/corelib}
 * @category contexts
 * @namespace
 */
export { Dimension }
