import SimpleSchema from 'simpl-schema'

/**
 * @private
 */
const defaultOptions =   {
  clean: {
    autoConvert: true,
    extendAutoValueContext: {},
    filter: false,
    getAutoValues: true,
    removeEmptyStrings: true,
    removeNullsFromArrays: false,
    trimStrings: true,
  },
  humanizeAutoLabels: false,
  requiredByDefault: true
}

/**
 * Creates a new schema instance
 * @param schema {object} the schema definitions
 * @param options {object?} optional schema validation/clean options
 */
export const createSchema = (schema, options) => {
  const fullOptions = { ...defaultOptions, ...options }
  return new SimpleSchema(schema, fullOptions)
}

export const RegEx = { ...SimpleSchema.RegEx }