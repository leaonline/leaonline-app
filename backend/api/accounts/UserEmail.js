import { RegEx } from '../../infrastructure/factories/createSchema'

export const UserEmail = {}

UserEmail.schema = () => ({
  type: String,
  optional: true,
  regEx: RegEx.EmailWithTLD
})

UserEmail.encrypt = (email) => {
  return email
}

UserEmail.decrypt = (encryptedEmail) => {
  return encryptedEmail
}
