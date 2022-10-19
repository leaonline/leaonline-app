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

  restore: String,

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
 * @method
 * @param {string=} email optional user email to send restore codes
 */
Users.methods.create = {
  name: 'users.methods.create',
  isPublic: true,
  schema: {
    voice: {
      type: String,
      optional: true
    },
    speed: {
      type: Number,
      optional: true
    }
  },
  run: onServerExec(function () {
    import { Random } from 'meteor/random'

    return function (options = {}) {
      const { userId } = this
      if (userId) {
        throw new Meteor.Error(
          'createUser.error',
          'createUser.alreadyExist',
          { userId }
        )
      }
      const { voice, speed } = options
      const username = Random.hexString(32)
      const password = Random.secret()
      const codes = RestoreCodes.generate()
      const restore = codes.join('-')
      const newUserId = Accounts.createUser({ username, password })
      const updateDoc = { restore, voice, speed }

      Meteor.users.update(newUserId, { $set: updateDoc })

      const credentials = { user: { username }, password }
      Accounts._runLoginHandlers(this, credentials)
      return Accounts._loginUser(this, newUserId)
    }
  })
}

Users.methods.restore = {
  name: 'users.methods.restore',
  isPublic: true,
  schema: {
    codes: Array,
    'codes.$': String,
    voice: {
      type: String,
      optional: true
    },
    speed: {
      type: Number,
      optional: true
    }
  },
  run: function ({ codes, voice, speed }) {
    const restore = codes.join('-')
    const userCursor = Meteor.users.find({ restore })

    if (userCursor.count() === 0) {
      throw new Meteor.Error(
        'permissionDenied',
        'restore.failed',
        { codes }
      )
    }

    const user = userCursor.fetch()[0]
    const hasVoice = typeof voice === 'string'
    const hasSpeed = typeof speed === 'number'

    if (hasVoice || hasSpeed) {
      const update = {}
      if (hasVoice) { update.voice = voice }
      if (hasSpeed) { update.speed = speed }
      Meteor.users.update(user._id, { $set: update})
    }

    return Accounts._loginUser(this, user._id)
  }
}

Users.methods.getCodes = {
  name: 'users.methods.getCodes',
  schema: {},
  run: function () {
    const { userId } = this
    const user = userId && Meteor.users.findOne(userId)

    if (!user) {
      throw new Meteor.Error(
        'permissionDenied',
        'getCodes.failed',
        { userId }
      )
    }

    return user.restore
  }
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
