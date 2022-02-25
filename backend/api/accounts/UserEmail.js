import { RegEx } from '../../infrastructure/factories/createSchema'
import crypto from 'crypto'

export const UserEmail = {}

UserEmail.schema = () => ({
  type: String,
  optional: true,
  regEx: RegEx.EmailWithTLD
})

UserEmail.encrypt = (email) => {
  const algorithm = 'aes-256-cbc'
  // const algorithm = process.env.ALGORITHM
  const key = crypto.randomBytes(32)
  // const key = process.env.KEY
  const iv = crypto.randomBytes(16)
  // const iv = process.env.IV

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
  // const algorithm = process.env.ALGORITHM
  // const key = process.env.KEY
  // const iv = process.env.IV
  const decipher = crypto.createDecipheriv(algorithm, key, iv)

  let decryptedEmail = decipher.update(encryptedEmail, "hex", "utf-8")

  decryptedEmail += decipher.final("utf8")

  console.log("Decrypted email: " + decryptedEmail)

  return decryptedEmail
}
