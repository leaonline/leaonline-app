/* eslint-env mocha */
import { UserEmail } from '../../accounts/UserEmail'
import { expect } from 'chai'

describe('crypto tests', () => {
  it('check if encryption and decryption works', () => {
    expect(UserEmail.decrypt(UserEmail.encrypt('a@a.de'))).to.equal('a@a.de')
  })
  it('check if the IV of encryption is random', () => {
    const encryptedEmailWithIV = UserEmail.encrypt('a@a.de')
    expect(UserEmail.encrypt('a@a.de') === (encryptedEmailWithIV)).to.equal(false)
  })
})
