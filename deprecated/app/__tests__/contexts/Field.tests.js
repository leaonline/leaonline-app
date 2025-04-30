import { Field } from '../../lib/contexts/Field'
import { createContextBaseTests } from '../../__testHelpers__/createContextBaseTests'

describe(Field.name, function () {
  createContextBaseTests({ ctx: Field })
})
