import Meteor from '@meteorrn/core'

const maxTimeout = 10000
const interval = 250

export const connectMeteor = ({ endpoint }) => {
  return new Promise((resolve, reject) => {
    const status = Meteor.status()

    if (status.connected) { return resolve(status) }

    // TODO use environment variables
    try {
      Meteor.connect(endpoint)
    } catch (e) {
      return reject(e)
    }

    let count = 0
    let timer = setInterval(() => {
      const updatedStatus = Meteor.status()

      if (updatedStatus.connected) {
        clearInterval(timer)
        timer = null
        return resolve(updatedStatus)
      }

      if (count > maxTimeout) {
        clearInterval(timer)
        timer = null
        reject(new Error('connectMeteorTimeout'))
      }

      count += interval
    }, interval)
  })
}
