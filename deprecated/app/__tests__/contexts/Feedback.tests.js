import { Feedback } from '../../lib/contexts/Feedback'
import { createContextBaseTests } from '../../__testHelpers__/createContextBaseTests'

describe(Feedback.name, function () {
  createContextBaseTests({ ctx: Feedback })
})
