import { Meteor } from 'meteor/meteor'
import crypto from 'node:crypto'

/**
 * Represents User Email encrypt/decrypt functionality
 * @category api
 * @namespace
 */
const SensitiveData = {}

const { algorithm, key, outputFormat } = Meteor.settings.crypto

SensitiveData.validate = value => {
  if (typeof value !== 'string' || value.length < 1) {
    throw new Error(`expected valid string with min. length of 1, got ${value}`)
  }
}

/**
 * Encrypt an existing use ermail
 * @param data {string}
 * @return {string}
 */
SensitiveData.encrypt = (data) => {
  SensitiveData.validate(data)
  const iv = crypto.randomBytes(16).toString('hex').slice(0, 16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(data, 'utf8', outputFormat)
  encrypted += cipher.final(outputFormat)
  encrypted += ':'
  encrypted += iv
  return encrypted
}

/**
 * Decrypts and existing user email
 * @param data {string}
 * @return {string}
 */
SensitiveData.decrypt = (data) => {
  const fields = data.split(':')
  const iv = fields[1]
  const encrypted = fields[0]
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encrypted, outputFormat, 'utf-8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export { SensitiveData }
