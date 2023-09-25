import { Meteor } from 'meteor/meteor'
import { getCollection } from '../../api/utils/getCollection'
import { Session } from '../session/Session'
import { Progress } from '../progress/Progress'
import { createLog } from '../../infrastructure/log/createLog'
import { Response } from '../response/Response'

/**
 * Removes a given user plus all their associated sessions, responses and feedbacks.
 * @param userId {String}
 * @param calledBy {String}
 * @return {{responsesRemoved: Number, sessionsRemoved: Number, userRemoved: Number}}
 */
export const removeUser = function (userId, calledBy) {
  debug({ userId, calledBy })
  const user = Meteor.users.findOne(userId)

  if (!user) {
    throw new Meteor.Error('removeUser.error', 'removeUser.userDoesNotExist', {
      userId,
      calledBy
    })
  }

  const responsesRemoved = getCollection(Response.name).remove({ userId })
  const sessionsRemoved = getCollection(Session.name).remove({ userId })
  const progressRemoved = getCollection(Progress.name).remove({ userId })
  const userRemoved = Meteor.users.remove({ _id: userId })

  return {
    responsesRemoved,
    sessionsRemoved,
    progressRemoved,
    userRemoved
  }
}

const debug = createLog({ name: removeUser.name, type: 'debug' })
