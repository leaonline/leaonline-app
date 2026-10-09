/* eslint-env mocha */
// import { expect } from 'chai'
import { RestoreCodes } from '../RestoreCodes'
import { createSchema } from '../../../infrastructure/factories/createSchema'

describe(RestoreCodes.name, function () {
  it('generates valid restore codes', () => {
    const restoreSchema = createSchema(RestoreCodes.schema())
    const restore = RestoreCodes.generate()
    restoreSchema.validate({ restore })
  })
})
