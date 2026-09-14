import { Field } from '../../contexts/Field'
import { Order } from '../../contexts/Order'
import { byOrderedIds } from '../../utils/array/byOrderedIds'
import { Log } from '../../infrastructure/Log'

/**
 * Loads the available fields for the home screen.
 * @return {Promise<object[]>}
 */
export const loadHomeData = async () => {
  const fields = Field.collection().find().fetch()
  const order = Order.collection().findOne()

  if (Array.isArray(order?.fields) && order.fields.length > 0) {
    debug('sort fields by order:')
    Log.print({ fields })
    Log.print({ 'order.fields': order.fields })
    fields.sort(byOrderedIds(order.fields))
  }

  return fields
}

const debug = Log.create(loadHomeData.name, 'debug')
