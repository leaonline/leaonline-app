import { ServiceRegistry } from '../../api/remotes/ServiceRegistry'
import SimpleSchema from 'simpl-schema'

const schemaOptions = Object.keys(ServiceRegistry.schemaOptions)
schemaOptions.push('autoform')

SimpleSchema.extendOptions(schemaOptions)

const defaultOptions =   {
  clean: {
    autoConvert: true,
    extendAutoValueContext: {},
    filter: true,
    getAutoValues: true,
    removeEmptyStrings: true,
    removeNullsFromArrays: false,
    trimStrings: true,
  },
  humanizeAutoLabels: false,
  requiredByDefault: true,
}

/**
 * Creates an instance of our current schema implementation.
 *
 * @method
 * @param schema {object}
 * @param options {object=}
 * @return {SimpleSchema}
 */
export const createSchema = (schema, options) => {
  const finalOptions = { defaultOptions,  ...options }
  return new SimpleSchema(schema, finalOptions)
}

/**
 * The schema implementation's collection of default RegExp values
 * @type {object}
 */
export const RegEx = SimpleSchema.RegEx

/**
 * The schema implementation's current definition for `type: Integer`
 * @type {string}
 */
export const Integer = SimpleSchema.Integer

/**
 * The schema implementation's way to allow multiple types.
 * @type {function}
 */
export const oneOf = SimpleSchema.oneOf
