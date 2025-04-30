import Meteor from '@meteorrn/core'

export const mockCall = callback => {
  const data = {
    waitDdpConnected: fn => fn()
  }
  jest
    .spyOn(Meteor, 'getData')
    .mockImplementation(() => data)
  jest
    .spyOn(Meteor, 'call')
    .mockImplementation(callback)
}
