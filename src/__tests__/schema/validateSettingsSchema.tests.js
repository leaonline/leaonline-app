import { validateSettingsSchema } from '../../lib/schema/validateSettingsSchema'
import settings from '../../lib/settings.json'

describe(validateSettingsSchema.name, function () {
  it('throws in invalid settings schema', () => {
    ;[undefined, {}, { settings: {} }].forEach(args => {
      expect(() => validateSettingsSchema(args))
        .toThrow('is required')
    })
  })

  it('validates the settings schema', () => {
    validateSettingsSchema({ settings })
  })
})
