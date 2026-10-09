import { isSchemaInstance } from './isSchemaInstance'
import { createSchema } from './createSchema'

export const check = (target, schema) => {
  // if we already have a simple schema instance we
  // immediately delegate validation to this one
  if (isSchemaInstance(schema)) {
    schema.validate(target)
    return
  }

  if (typeof schema === 'object') {
    createSchema(schema).validate(target)
    return
  }

  createSchema({ target: schema }).validate({ target })
}
