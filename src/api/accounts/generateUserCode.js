import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Random } from 'meteor/random'

const forbidden = /[0oq17ij5s]+/gi

/**
 * Generates a new code for usernames. The code has to be unique (there must not
 * be any user with this code already) and must pass a RegEx to not contain
 * certain characters.
 *
 * Retries until a code is found or a maximum of retries is reached; otherwise
 * throws a {Meteor.Error}.
 *
 * @param length {number} the length of the code in chars
 * @param maxRetries {number} the number of maxmimum retries
 * @throws {Meteor.Error} if no code could be generated within maxRetries
 * @return {Promise<String>} the code for the usernames
 */

export const generateUserCode = async (length = 5, maxRetries = 500) => {
  let count = 0

  while (count++ < maxRetries) {
    const code = Random.id(length).toUpperCase()

    if (!forbidden.test(code) && !(await Accounts.findUserByUsername(code))) {
      return code
    }
  }

  throw new Meteor.Error(
    'generateUserCode.error',
    'generateUserCode.maxTriesExceeded')
}
