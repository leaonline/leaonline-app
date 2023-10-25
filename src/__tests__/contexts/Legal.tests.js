import { Legal } from '../../lib/contexts/Legal'
import { createContextBaseTests } from '../../__testHelpers__/createContextBaseTests'

describe(Legal.name, function () {
  createContextBaseTests({ ctx: Legal })
})
