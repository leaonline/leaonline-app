/* eslint-env mocha */
import { SensitiveData } from '../SensitiveData'
import { expect } from 'chai'

describe('crypto tests', () => {
  it('check if encryption and decryption works', () => {
    expect(SensitiveData.decrypt(SensitiveData.encrypt('a@a.de'))).to.equal('a@a.de')
  })
  it('check if the IV of encryption is random', () => {
    const encryptedEmailWithIV = SensitiveData.encrypt('a@a.de')
    expect(SensitiveData.encrypt('a@a.de') === (encryptedEmailWithIV)).to.equal(false)
  })
})
