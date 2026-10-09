import { validateSettingsSchema } from '../../lib/schema/validateSettingsSchema'

describe(validateSettingsSchema.name, function () {
  it('validates the settings schema', () => {
    validateSettingsSchema()
  })
})
