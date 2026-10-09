import SimpleSchema from 'simpl-schema'

export const createSessionValidator = ({ schema }) => {
  return new SessionValidator({ schema })
}

class SessionValidator {
  constructor ({ schema }) {
    this.singles = new Map()
    this.documents = new Map()

    const getDict = type => {
      if (type === 'scalar') return this.singles
      if (type === 'document') return this.documents
    }

    Object.entries(schema).forEach(([key, definitions]) => {
      const { isArray = false, type } = definitions
      const dict = getDict(type)

      if (!dict) {
        throw new Error(`Unknown type ${type} for ${key}`)
      }

      dict.set(key, { isArray, schema: new SimpleSchema(definitions.schema) })
    })
  }

  validateKey (key) {
    if (!this.singles.has(key) && !this.documents.has(key)) {
      throw new Error(`Key "${key}" not in Session-schema!`)
    }
  }

  validateDoc (doc) {
    Object.entries(doc).forEach(([key, value]) => {
      this.validateKey(key)
    })
  }
}
