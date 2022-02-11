import SimpleSchema from 'simpl-schema'

export const createSchema = (schema, options) => {
  return new SimpleSchema(schema, options)
}

export const RegEx = SimpleSchema.RegEx
