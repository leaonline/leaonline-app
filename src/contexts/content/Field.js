import { Field } from 'meteor/leaonline:corelib/contexts/Field'
import { onClientExec } from '../../utils/archUtils'
import { createGetAllMethod } from '../../api/services/createGetAllMethod'
import { createGetMethod } from '../../api/services/createGetMethod'

Field.sync = true

onClientExec(() => {
  Field.isLocal = true
})

Field.methods = Field.methods ?? {}
Field.methods.getAll = createGetAllMethod({ context: Field, backendOnly: false, defaultQuery: { legacy: { $ne: true } } })
Field.methods.get = createGetMethod({ context: Field, backendOnly: false })
/**
 * See the corelib documentation for further into: {@link https://github.com/leaonline/corelib}
 * @category contexts
 * @namespace
 */
export { Field }
