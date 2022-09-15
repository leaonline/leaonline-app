import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { RestoreCodes } from '../../api/accounts/RestoreCodes'
import { UserEmail } from '../../api/accounts/UserEmail'

/**
 * Representation of users in the database.
 * @namespace
 * @category contexts
 */
const Users = {
  /**
   * Name, to be used as collection name.
   */
  name: 'users'
}

/**
 * The db schema definitions.
 * @type {object}
 * @namespace
 * @category contexts
 */
Users.schema = {
  /**
   * Definition for valid usernames.
   */
  username: {
    type: String,
    min: 32,
    regEx: /[a-f0-9]{32}/i
  },

  /**
   * Determines when this user has been created
   */
  createdAt: Date,

  /**
   * services schema can be a bit complex at times, since Meteor uses it
   * for multiple authentication and verification scenarios
   */
  services: {
    type: Object
  },
  'services.password': {
    type: Object
  },
  'services.password.bcrypt': {
    type: String,
    regEx: /^\$2b\$.{56}$/
  },
  'services.resume': {
    type: Object
  },
  'services.resume.loginTokens': {
    type: Array,
    optional: true
  },
  'services.resume.loginTokens.$': {
    type: Object
  },
  'services.resume.loginTokens.$.when': {
    type: Date
  },
  'services.resume.loginTokens.$.hashesToken': {
    type: String
  },

  // adding the restore code schema from them,
  // since this can changed, based on Meteor.settings
  ...RestoreCodes.schema(),

  // adding Email schema from UserEmail
  ...UserEmail.schema()
}

/**
 * Meteor method endpoints.
 * @category contexts
 * @memberof Users
 * @type {object}
 * @namespace Users.methods
 */
Users.methods = {}

/**
 * Creates a new user account. Auto-generates username and password:
 * - the username is a 32 character long hex-String
 * - the password is a 43 character long varchar string
 *
 * Stores email only encrypted, email is only used to send confirmation and
 * restore email.
 *
 * Additionally restore codes are generated and added to the user.
 *
 * The created user is returned, separated from the password, which
 * should only be used once to store it in a mobile's secure storage.
 *
 * @method
 * @param {string=} email optional user email to send restore codes
 */
Users.methods.create = {
  name: 'users.methods.create',
  isPublic: true,
  schema: {
    email: UserEmail.schema()
  },
  run: onServerExec(function () {
    import { Random } from 'meteor/random'

    return function (options) {
      const email = options?.email
      const username = Random.hexString(32)
      const password = Random.secret()
      const restore = RestoreCodes.generate()

      const userId = Accounts.createUser({ username, password })
      const updateDoc = { restore }

      // email can be optional and is used for restoring accounts
      if (email) {
        updateDoc.email = UserEmail.encrypt(email)
      }

      Meteor.users.update(userId, { $set: updateDoc })

      const user = Meteor.users.findOne(userId, { fields: { services: 0 } })
      console.debug('user created:', user._id)

      return { user, password }
    }
  })
}

/**
 * Deletes the user's current account. It only deletes the account, if
 * the current logged-in user invokes this fn plus it matches the
 * given _id and username.
 *
 * Otherwise, it throws a permissionDenied error.
 *
 * @method
 * @param {string} _id
 * @param {string} username
 */
Users.methods.delete = {
  name: 'users.methods.delete',
  schema: {
    _id: String,
    username: String
  },
  run: onServerExec(function () {
    return function ({ _id, username }) {
      if (_id !== this.userId || Meteor.users.find({ _id, username }).count() === 0) {
        throw new Meteor.Error('403', 'permissionDenied', { _id })
      }

      // TODO delete all associated data here, too

      return !!Meteor.users.remove({ _id, username })
    }
  })
}

export { Users }
