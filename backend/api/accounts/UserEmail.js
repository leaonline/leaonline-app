import { RegEx } from '../../infrastructure/factories/createSchema'
import crypto from 'crypto'
import { Meteor } from 'meteor/meteor'

export const UserEmail = {}

UserEmail.schema = () => ({
  type: String,
  optional: true,
  regEx: RegEx.EmailWithTLD
})

UserEmail.encrypt = (email) => {
  const algorithm = 'aes-256-cbc'
  // const key = Meteor.settings.key
  const key = '12345678901234567890123456789012'
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encryptedEmail = cipher.update(email, 'utf8', 'hex')
  encryptedEmail += cipher.final('hex')
  encryptedEmail += ':'
  encryptedEmail += iv

  console.log('Decrypted email: ' + encryptedEmail)

  return email
}

UserEmail.decrypt = (encryptedEmailwithIV) => {
  const algorithm = 'aes-256-cbc'
  const fields = encryptedEmailwithIV.split(':')
  const iv = fields[1]
  const encryptedEmail = fields[0]

  const key = Meteor.settings.key
  const decipher = crypto.createDecipheriv(algorithm, key, iv)

  let decryptedEmail = decipher.update(encryptedEmail, 'hex', 'utf-8')

  decryptedEmail += decipher.final('utf8')

  return decryptedEmail
}
