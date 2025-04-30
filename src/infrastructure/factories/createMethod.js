import { createMethodFactory } from 'meteor/leaonline:method-factory'
import { createSchema } from './createSchema'
import { createLog } from '../log/createLog'
import { environmentExtensionMixin } from '../mixins/environmentExtensionMixin'
import { checkPermissions } from '../mixins/checkPermissions'
import { errorMixin } from '../mixins/errorMixin'

const log = createLog({ name: 'createMethod' })
const methodFactory = createMethodFactory({
  schemaFactory: createSchema,
  mixins: [checkPermissions, errorMixin, environmentExtensionMixin]
})

export const createMethod = method => {
  log(method.name)
  return methodFactory(method)
}
