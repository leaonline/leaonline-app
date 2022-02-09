import { isSchemaInstance } from './isSchemaInstance'
import { createSchema } from './createSchema'

export const check = (target, schema) => {
  // if we already have a simple schema instance we
  // immediately delegate validation to this one
  if (isSchemaInstance(schema)) {
    return schema.validate(target)
  }

  if (typeof schema === 'object') {
    return createSchema(schema).validate(target)
  }

  return createSchema({ target: schema }).validate({ target })
}
