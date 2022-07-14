import { ServiceRegistry } from '../../api/remotes/ServiceRegistry'
import SimpleSchema from 'simpl-schema'

const schemaOptions = Object.keys(ServiceRegistry.schemaOptions)
schemaOptions.push('autoform')

SimpleSchema.extendOptions(schemaOptions)

/**
 *
 * @param schema
 * @param options
 * @return {SimpleSchema}
 */
const createSchema = (schema, options) => {
  return new SimpleSchema(schema, options)
}

export const RegEx = SimpleSchema.RegEx

export const Integer = SimpleSchema.Integer

export const oneOf = SimpleSchema.oneOf

export { createSchema }
