import { createSchema } from '../../schema/createSchema'
import { isSchemaInstance } from '../../schema/isSchemaInstance'
import { check } from '../../schema/check'

it('creates a new schema instance', function () {
  const schema = createSchema({ foo: String })
  expect(isSchemaInstance(schema)).toBe(true)
})

it('uses check to check against a schema', function () {
  const schema = createSchema({ foo: String })
  expect(() => check({}, schema)).toThrow('foo is required')
  expect(() => check({ foo: 1 }, schema)).toThrow('foo must be of type String')
})

it('creates a schema on the fly in check when no schema is passed', function () {
  expect(() => check({}, { foo: String })).toThrow('foo is required')
  expect(() => check({ foo: 1 }, { foo: String })).toThrow('foo must be of type String')

  const arraySchema = {
    foo: {
      type: Array,
      min: 1
    },
    'foo.$': String
  }
  expect(() => check({ foo: [1] }, arraySchema)).toThrow('foo must be of type String')
  expect(()=> check(1, String)).toThrow('target must be of type String')
})
