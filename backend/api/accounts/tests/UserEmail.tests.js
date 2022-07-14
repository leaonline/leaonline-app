/* eslint-env mocha */
import { expect } from 'chai'
import { UserEmail } from '../UserEmail'
import { createSchema } from '../../../infrastructure/factories/createSchema'

describe('UserEmail', function () {
  describe('schema', function () {
    it('returns the common schema definition for user emails', function () {
      const emailSchema = createSchema({
        email: UserEmail.schema()
      })
      emailSchema.validate({ email: 'me@example.com'})
    })
  })
  describe('encrypt', function () {
    it('creates an encrypted field', function () {
      const enc = UserEmail.encrypt('me@example.com')
      expect(UserEmail.decrypt(enc)).to.equal('me@example.com')
    })
  })
})
