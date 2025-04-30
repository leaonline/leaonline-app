/* eslint-env mocha */
import { SensitiveData } from '../SensitiveData'
import { expect } from 'chai'

describe('SensitiveData', () => {
  it('throws if the input to encrypt is not a valid string', () => {
    [undefined, null, '', 1, [], {}, true, () => {}, new Date()].forEach(value => {
      expect(() => SensitiveData.encrypt(value)).to.throw(`Expected valid string with min. length of 1, got ${value}`)
    })
  })
  it('check if encryption and decryption works', () => {
    expect(SensitiveData.decrypt(SensitiveData.encrypt('a@a.de'))).to.equal('a@a.de')
  })
  it('check if the IV of encryption is random', () => {
    const encryptedEmailWithIV = SensitiveData.encrypt('a@a.de')
    expect(SensitiveData.encrypt('a@a.de') === (encryptedEmailWithIV)).to.equal(false)
  })
})
