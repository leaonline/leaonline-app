const SimpleSchema = require('simpl-schema')
const settingsSchemaModule = require('./lib/settingsSchema.js')
const fs = require('fs')
const path = require('path')

const { settingsSchema } = settingsSchemaModule
const settingsStr = fs.readFileSync(path.resolve('src/lib/settings.json'), 'utf-8')
const settings = JSON.parse(settingsStr)
const schema = new SimpleSchema(settingsSchema)
schema.validate(settings)
