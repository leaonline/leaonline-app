import { Meteor } from 'meteor/meteor'
import { getCollection } from '../../api/utils/getCollection'
import { Session } from '../session/Session'
import { Progress } from '../progress/Progress'
import { Response } from '../response/Response'
import { createLog } from '../../infrastructure/log/createLog'
import { getUsersCollection } from '../../api/collections/getUsersCollection'

/**
 * Removes a given user plus all their associated sessions, responses and feedbacks.
 * @async
 * @param userId {String}
 * @param calledBy {String}
 * @return {{responsesRemoved: Number, sessionsRemoved: Number, userRemoved: Number}}
 */
export const removeUser = async (userId, calledBy) => {
  debug({ userId, calledBy })
  const UsesCollection = getUsersCollection()
  const user = await UsesCollection.findOneAsync(userId)

  if (!user) {
    throw new Meteor.Error('removeUser.error', 'removeUser.userDoesNotExist', {
      userId,
      calledBy
    })
  }

  const responsesRemoved = await getCollection(Response.name).removeAsync({ userId })
  const sessionsRemoved = await getCollection(Session.name).removeAsync({ userId })
  const progressRemoved = await getCollection(Progress.name).removeAsync({ userId })
  const userRemoved = await UsesCollection.removeAsync({ _id: userId })

  return {
    responsesRemoved,
    sessionsRemoved,
    progressRemoved,
    userRemoved
  }
}

const debug = createLog({ name: removeUser.name, type: 'debug' })
