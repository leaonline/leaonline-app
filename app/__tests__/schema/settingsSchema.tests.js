import { isSchemaInstance } from '../../lib/schema/isSchemaInstance'
import settings from '../../settings/settings.json'
import { settingsSchema } from '../../lib/settingsSchema'

describe('settingsSchema', function () {
  it('verifies the schema', () => {
    expect(isSchemaInstance(settingsSchema)).toBe(true)
    settingsSchema.validate(settings)
  })
})
