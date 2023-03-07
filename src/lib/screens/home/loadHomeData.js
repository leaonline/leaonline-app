import { Field } from '../../contexts/Field'
import { Order } from '../../contexts/Order'
import { byOrderedIds } from '../../utils/array/byOrderedIds'

export const loadHomeData = async () => {
  const fields = Field.collection().find().fetch()
  const order = Order.collection().findOne()

  if (Array.isArray(order?.fields)) {
    fields.sort(byOrderedIds(order.fields))
  }

  return fields
}
