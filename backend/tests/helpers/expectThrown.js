import { expect } from 'chai'

export const expectThrown = ({ fn, name, reason, details }) => {
  const thrown = expect(fn)
    .to.throw(name)

  if (reason) {
    thrown.with.property('reason', reason)
  }
  if (details) {
    thrown.with.deep.property('details', details)
  }
}