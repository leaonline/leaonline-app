import { RegEx } from '../../infrastructure/factories/createSchema'
import crypto from 'crypto'

export const UserEmail = {}

UserEmail.schema = () => ({
  type: String,
  optional: true,
  regEx: RegEx.EmailWithTLD
})

UserEmail.encrypt = (email) => {
  const crypto = require('crypto')
  const algorithm = 'aes-256-cbc'
  const key = crypto.randomBytes(32)
  const iv = crypto.randomBytes(16)

  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encryptedEmail = cipher.update(email, 'utf8', 'hex')
  encryptedEmail += cipher.final('hex')
  console.log("Encrypted email:" + encryptedEmail)
  // return encryptedEmail
  return email
}

UserEmail.decrypt = (encryptedEmail) => {
  const algorithm = 'aes-256-cbc'
  const key = process.env.KEY
  const iv = process.env.IV
  const decipher = crypto.createDecipheriv(algorithm, key, iv)

  let decryptedEmail = decipher.update(encryptedEmail, "hex", "utf-8")

  decryptedEmail += decipher.final("utf8")

  console.log("Decrypted email: " + decryptedEmail)

  return decryptedEmail
}
