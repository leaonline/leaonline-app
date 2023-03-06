import { settingsSchema } from '../settingsSchema'

/**
 * Validate the settings.json file against the
 * settings schema
 */
export const validateSettingsSchema = ({ settings = {} } = {}) => {
  settingsSchema.validate(settings)
}
