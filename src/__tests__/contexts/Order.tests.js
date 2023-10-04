import { Order } from '../../lib/contexts/Order'
import { createContextBaseTests } from '../../__testHelpers__/createContextBaseTests'

describe(Order.name, function () {
  createContextBaseTests({ ctx: Order })
})
