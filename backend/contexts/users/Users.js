import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { onServerExec } from '../../infrastructure/arch/onServerExec'
import { RestoreCodes } from '../../api/accounts/RestoreCodes'
import { updateUserProfile } from './updateUserProfile'
import { removeUser } from './removeUser'
import { getUsersCollection } from '../../api/collections/getUsersCollection'
import { createLog } from '../../infrastructure/log/createLog'

/**
 * Representation of users in the database.
 * @namespace
 * @category contexts
 */
const Users = {
  /**
   * Name, to be used as collection name.
   */
  name: 'users',
  label: 'users.title',
  icon: 'users',
  representative: '_id'
}

const debug = createLog({ name: Users.name, type: 'debug' })

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
   * Set when user successfully logs in
   */
  lastLogin: {
    type: Date,
    optional: true
  },

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

  /**
   * The restore code
   */
  restore: String,

  /**
   * The selected tts voice
   */
  voice: {
    type: String,
    optional: true
  },

  /**
   * The selected tts voice speed
   */
  speed: {
    type: Number,
    optional: true
  },

  /**
   * True if 2xoptin for research
   * has been completed
   */
  research: {
    type: Boolean,
    optional: true
  },

  isDev: {
    type: Boolean,
    optional: true
  },

  // adding Email schema from UserEmail
  // ...UserEmail.schema()

  /**
   * We save the current device info to associate
   * any client error with it by user-id.
   * Device info should contain no personal data
   */
  device: {
    type: Object,
    optional: true,
    blackbox: true
  }
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
 * Creates a new user and automatically authenticates them.
 * @method
 * @param options {object}
 * @param options.voice {string=} the current selected voice
 * @param options.speed {number=} the current selected speed for voices
 * @throws {Meteor.Error} if already authenticated
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
    },
    isDev: Users.schema.isDev,
    device: Users.schema.device
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

      const { voice, speed, isDev, device } = options
      const username = Random.hexString(32)
      const password = Random.secret()
      const codes = RestoreCodes.generate()
      const restore = codes.join('-')
      const newUserId = Accounts.createUser({ username, password })
      const updateDoc = { restore, voice, speed, isDev, device }

      getUsersCollection().update(newUserId, { $set: updateDoc })

      // validate the new account with the created credentials
      const credentials = { user: { username }, password }
      Accounts._runLoginHandlers(this, credentials)

      // finally, login this user as they should not need
      // to manually authenticate
      return Accounts._loginUser(this, newUserId)
    }
  })
}

/**
 * Allows users to update certain parts of their profile, such as
 * selected voice and speed.
 *
 * @method
 * @param options {object}
 * @param options.voice {string=} the current selected voice
 * @param options.speed {number=} the current selected speed for voices
 * @return {number} 1 if updated, 0 if not
 * @throws {Meteor.Error} if not authenticated or no options passed
 */
Users.methods.updateProfile = {
  name: 'users.methods.updateProfile',
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
  run: function ({ voice, speed }) {
    const { userId } = this
    const nothingToUpdate = typeof voice !== 'string' && typeof speed !== 'number'

    if (!userId || nothingToUpdate) {
      throw new Meteor.Error(
        'permissionDenied',
        'updateProfile.failed',
        { userId }
      )
    }

    return updateUserProfile({ userId, speed, voice })
  }
}

/**
 * Restores a user with a given restore-code.
 */
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
    },
    device: Users.schema.device
  },
  run: function ({ codes, voice, speed, device }) {
    const restore = codes.join('-')
    const userCursor = getUsersCollection().find({ restore })
    debug('restore with code', restore, '=> found', userCursor.count())

    if (userCursor.count() === 0) {
      throw new Meteor.Error(
        'permissionDenied',
        'restore.failed',
        { codes, restore }
      )
    }

    const user = userCursor.fetch()[0]
    const userId = user._id
    const hasVoice = typeof voice === 'string'
    const hasSpeed = typeof speed === 'number'

    if (hasVoice || hasSpeed || device) {
      const updateDoc = { userId, voice, speed, device }
      updateUserProfile(updateDoc)
    }

    return Accounts._loginUser(this, user._id)
  }
}

Users.methods.getCodes = {
  name: 'users.methods.getCodes',
  schema: {},
  run: function () {
    const { userId } = this
    const user = userId && getUsersCollection().findOne(userId)

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
  schema: {},
  run: onServerExec(function () {
    return function () {
      const { userId } = this
      return removeUser(userId, userId)
    }
  })
}

Users.methods.getAll = {
  name: 'users.methods.getAll',
  schema: {
    dependencies: {
      type: Array,
      optional: true
    },
    'dependencies.$': {
      type: Object,
      blackbox: true,
      optional: true
    }
  },
  backend: true,
  run: function () {
    const users = getUsersCollection().find({}, {
      fields: {
        services: 0,
        agents: 0
      },
      hint: {
        $natural: -1
      }
    }).fetch()

    return { users }
  }
}

Users.methods.remove = {
  name: 'users.methods.remove',
  schema: {
    _id: 1
  },
  backend: true,
  run: function ({ _id }) {
    const calledBy = this.userId
    return removeUser(_id, calledBy)
  }
}

export { Users }
