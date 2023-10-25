import { createTimedPromise } from '../../lib/utils/createTimedPromise'

const createPromise = (timeout, message = 'foo') => new Promise(resolve => {
  let timer = setTimeout(() => {
    clearTimeout(timer)
    resolve(message)
  }, timeout)
})

describe(createTimedPromise.name, function () {
  beforeAll(() => {
    jest.useFakeTimers({ advanceTimers: true })
  })
  it('resolves to the promise if it resolves faster', async () => {
    const myPromise = createPromise(250, 'foo1')
    const value = await createTimedPromise(myPromise)
    expect(value).toEqual('foo1')
  })
  it('resolves to the fallback promise if it resolves not fast enough', async () => {
    const myPromise = createPromise(1250)
    const value = await createTimedPromise(myPromise, { message: 'bar1' })
    expect(value).toEqual('bar1')
  })
  it('rejects the fallback promise if it resolves not fast enough and displays a custom message', () => {
    const myPromise1 = createPromise(1250)
    const options = { message: 'bar2', throwIfTimedOut: true }
    const race = createTimedPromise(myPromise1, options)
    expect(race).rejects.toThrow('bar2');
  })
  it('rejects the fallback promise if it resolves not fast enough and displays custom details', () => {
    const myPromise2 = createPromise(1250)
    const options = { throwIfTimedOut: true, details: { bar: 'baz1' } }
    const race = createTimedPromise(myPromise2, options)
    const target = expect(race).rejects
    target.toThrow('promise.timedOut')
    target.toHaveProperty('details', options.details)
  })
})
