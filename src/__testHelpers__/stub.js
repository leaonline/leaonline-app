import sinon from 'sinon'

export const stub = (target, prop, fn) => {
  const stub = sinon.stub(target, prop)
  stub.callsFake(fn)
  return stub
}

export const restoreAll = () => sinon.restore()
