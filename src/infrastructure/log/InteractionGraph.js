import { simpleRandomHex } from '../../utils/simpleRandomHex'
import { Log } from '../Log'

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
  const data = { type, subtype, timeStamp }

  if (id) { data.id = id }
  if (target) { data.target = target }
  if (message) { data.message = message }
  if (details) { data.details = details }
  console.debug(data)
  internal.stack.push(data)
}

const send = () => {}

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
