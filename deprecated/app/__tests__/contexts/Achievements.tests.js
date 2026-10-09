import { Achievements } from '../../lib/contexts/Achievements'
import { createContextBaseTests } from '../../__testHelpers__/createContextBaseTests'

describe(Achievements.name, function () {
  createContextBaseTests({ ctx: Achievements })
})
