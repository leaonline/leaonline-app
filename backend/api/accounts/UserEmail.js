import { RegEx } from '../../infrastructure/factories/createSchema'
import crypto from 'crypto'
import { Meteor } from 'meteor/meteor'

/**
 * Represents User Email encrypt/decrypt functionality
 * @category api
 * @namespace
 */
const UserEmail = {}

const { algorithm, key, outputFormat } = Meteor.settings.crypto

/**
 * Returns a UserEmail schema definition.
 * @return {{regEx: RegExp, optional: boolean, type: (function(String, String))}}
 */
UserEmail.schema = () => ({
  type: String,
  optional: true,
  regEx: RegEx.EmailWithTLD
})

/**
 * Encrypt an existing use ermail
 * @deprecated should be extracted into generic function
 * @param email {string}
 * @return {string}
 */
UserEmail.encrypt = (email) => {
  const iv = crypto.randomBytes(16).toString('hex').slice(0, 16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encryptedEmail = cipher.update(email, 'utf8', outputFormat)
  encryptedEmail += cipher.final(outputFormat)
  encryptedEmail += ':'
  encryptedEmail += iv
  return encryptedEmail
}

/**
 * Decrypts and existing user email
 * @param encryptedEmailWithIV
 * @return {string}
 */
UserEmail.decrypt = (encryptedEmailWithIV) => {
  const fields = encryptedEmailWithIV.split(':')
  const iv = fields[1]
  const encryptedEmail = fields[0]
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decryptedEmail = decipher.update(encryptedEmail, outputFormat, 'utf-8')
  decryptedEmail += decipher.final('utf8')
  return decryptedEmail
}

export { UserEmail }
