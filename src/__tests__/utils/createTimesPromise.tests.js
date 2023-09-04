import { createTimedPromise } from '../../lib/utils/createTimedPromise'

const createPromise = (timeout) => new Promise(resolve => {
  setTimeout(() => resolve('foo'), timeout)
})

describe(createTimedPromise.name, function () {
  it('resolves to the promise if it resolves faster', async () => {
    const myPromise = createPromise(250)
    const value = await createTimedPromise(myPromise)
    expect(value).toEqual('foo')
  })
  it('resolves to the fallback promise if it resolves not fast enough', async () => {
    const myPromise = createPromise(1250)
    const value = await createTimedPromise(myPromise, { message: 'bar' })
    expect(value).toEqual('bar')
  })
  it('rejects the fallback promise if it resolves not fast enough', async () => {
    const myPromise1 = createPromise(1250)

    try {
      await createTimedPromise(myPromise1, { message: 'bar', throwIfTimedOut: true })
    }
    catch(e) {
      expect(e.message).toEqual('bar')
      expect(e.details).toEqual(undefined)
    }

    const myPromise2 = createPromise(1250)
    try {
      await createTimedPromise(myPromise2, {throwIfTimedOut: true, details: { bar: 'baz'} })
    }
    catch(e) {
      expect(e.message).toEqual('promise.timedOut')
      expect(e.details).toEqual({ bar: 'baz'})
    }
  })
})
