import { settingsSchema } from '../settingsSchema'
import settings from '../settings.json'

/**
 * Validate the settings.json file against the
 * settings schema, run during startup
 */
export const validateSettingsSchema = () => {
  settingsSchema.validate(settings)
}
