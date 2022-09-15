import { ServiceRegistry } from '../../api/remotes/ServiceRegistry'
import SimpleSchema from 'simpl-schema'

const schemaOptions = Object.keys(ServiceRegistry.schemaOptions)
schemaOptions.push('autoform')

SimpleSchema.extendOptions(schemaOptions)

/**
 * Creates an instance of our current schema implementation.
 *
 * @method
 * @param schema
 * @param options
 * @return {SimpleSchema}
 */
export const createSchema = (schema, options) => {
  return new SimpleSchema(schema, options)
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
