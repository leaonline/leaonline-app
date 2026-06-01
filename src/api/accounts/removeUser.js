import { Meteor } from 'meteor/meteor'
import { Session } from '../../contexts/session/Session'
import { Response } from '../../contexts/response/Response'
import { Feedback } from '../../contexts/feedback/Feedback'

/**
 * Removes a given user plus all her associated sessions, responses and feedbacks.
 * @arch server
 * @param userId {String}
 * @param calledBy {String}
 * @param debug {Function}
 * @return {{responsesRemoved: Number, sessionsRemoved: Number, userRemoved: Number}}
 */
export const removeUser = async function (userId, calledBy, debug = () => {}) {
  debug(removeUser.name, { userId, calledBy })
  const user = await Meteor.users.findOneAsync(userId)

  if (!user) {
    throw new Meteor.Error('removeUser.error', 'removeUser.userDoesNotExist', {
      userId,
      calledBy
    })
  }

  const responsesRemoved = await Response.collection().removeAsync({ userId })
  const sessionsRemoved = await Session.collection().removeAsync({ userId })
  const feedbackRemoved = await Feedback.collection().removeAsync({ userId })
  const userRemoved = await Meteor.users.removeAsync({ _id: userId })

  return {
    responsesRemoved,
    sessionsRemoved,
    feedbackRemoved,
    userRemoved
  }
}
