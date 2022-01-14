import Meteor from '@meteorrn/core'

export const callMeteor = ({ name, args, prepare, receive, success, failure }) => {
  const status = Meteor.status()

  if (!status.connected) {
    return failure(new Error('Not connected to Meteor backend.'))
  }

  const promise = call({ name, args, prepare, receive })

  if (typeof success === 'function') {
    promise.then(success)
  }

  if (typeof failure === 'function') {
    promise.catch(failure)
  }

  return promise
}

const call = ({ name, args, prepare, receive }) => new Promise((resolve, reject) => {
  // inform that we are connected and about to call the server
  if (prepare) { prepare() }

  Meteor.call(name, args, (error, result) => {
    // inform that we are have received
    // something back from the server
    if (typeof receive === 'function') { receive() }

    if (error) {
      return reject(error)
    }

    return resolve(result)
  })
})
