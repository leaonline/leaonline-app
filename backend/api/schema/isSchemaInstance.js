import SimpleSchema from 'simpl-schema'

/**
 * Checks, whether a schema is instance of SimpleSchema
 * @param schema {*}
 * @return {boolean}
 * @module
 */
export const isSchemaInstance = schema => schema instanceof SimpleSchema
