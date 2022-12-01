import { simpleRandomHex } from '../../utils/simpleRandomHex'
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
  const timeStamp = new Date()
  const data = { sessionId, type, subtype, timeStamp }

  if (id) { data.id = id }
  if (target) { data.target = target }
  if (message) { data.message = message }
  if (details) { data.details = details }

  debug('queue', data)
  internal.stack.push(data)
}

const send = () => {
  debug('send', internal.stack.length, 'graph-items')
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
    message: message || error.reason || error.message,
    details: {
      stack: error.stack
    }
  })
  send()
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
