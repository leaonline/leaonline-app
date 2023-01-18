import { simpleRandomHex } from '../../utils/simpleRandomHex'
import { callMeteor } from '../../meteor/call'
import Meteor from '@meteorrn/core'
import { Log } from '../Log'

/**
 * This id is generated when the module is loaded and allows
 * to keep track of events between sending batches
 * TODO store in async storage and restore when coming from background
 * @private
 * @type {string}
 */
const sessionId = simpleRandomHex(10)
const debug = Log.create('InterActionGraph', 'debug')

/**
 * Use this to track interaction with the app
 * and send them in batches to the server.
 *
 * @type {object}
 */
export const InteractionGraph = {}

const internal = {

  stack: []
}
const queue = ({ type, subtype, id, target, message, details }) => {
  const timestamp = new Date()
  const data = { sessionId, type, subtype, timestamp }

  if (id) { data.id = id }
  if (target) { data.target = target }
  if (message) { data.message = message }
  if (details) { data.details = details }

  debug('queue', data)
  internal.stack.push(data)
}

const send = () => {
  const user = Meteor.user()

  // the data is only sent to the server,
  // if the user has actively participated
  // in our research programme
  if (user?.research === true) {
    const data = [].concat(internal.stack)
    debug('send', data, 'graph-items')
    internal.stack.length = 0
    callMeteor({
      name: 'interactionGraph.methods.send',
      args:  { data },
      failure: e => Log.error(e)
    }).catch(e => Log.error(e))
  }
}

InteractionGraph.enterApp = () => {
  queue({
    type: 'app',
    subtype: 'enter'
  })
}

InteractionGraph.enterScreen = ({ screen }) => {
  queue({
    type: 'screen',
    subtype: 'enter',
    target: screen
  })
}

InteractionGraph.leaveApp = () => {
  queue({
    type: 'app',
    subtype: 'leave'
  })
}

InteractionGraph.action = ({ id = simpleRandomHex(), target, type, message, details }) => {
  queue({
    type: 'action',
    subtype: type,
    target,
    id,
    message,
    details
  })
  return id
}

InteractionGraph.reaction = ({ id, target, type, message, details }) => {
  queue({
    type: 'reaction',
    subtype: type,
    target,
    id,
    message,
    details
  })
}
InteractionGraph.problem = ({ id, target, type, message, details, error }) => {
  queue({
    type: 'problem',
    subtype: type,
    id,
    target,
    message: message || error?.reason || error?.message,
    details: error?.details
  })

  //send()
}
InteractionGraph.goal = ({ type, target, message, details }) => {
  queue({
    type: 'goal',
    subtype: type,
    target,
    message,
    details
  })
  send()
}

InteractionGraph.toTargetGraph = (...targets) => targets.join('::')
