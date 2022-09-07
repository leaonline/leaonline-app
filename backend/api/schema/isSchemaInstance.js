import SimpleSchema from 'simpl-schema'

/**
 * Checks, whether a schema is instance of SimpleSchema
 * @param schema {any} the schema object to be schecked
 * @return {boolean} true if instanceof SimpleSchema, otherwise false
 * @category api
 * @function
 * @module isSchemaInstance
 */
export const isSchemaInstance = schema => schema instanceof SimpleSchema
