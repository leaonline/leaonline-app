import { Level } from '../../lib/contexts/Level'
import { createContextBaseTests } from '../../__testHelpers__/createContextBaseTests'

describe(Level.name, function () {
  createContextBaseTests({ ctx: Level })
})
