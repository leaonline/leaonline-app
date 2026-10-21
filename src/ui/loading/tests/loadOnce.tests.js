/* eslint-env mocha */
import { Tracker } from 'meteor/tracker'
import { expect } from 'chai'
import { loadOnce } from '../loadOnce'

const waitUntilDone = (loaded, done) => {
  Tracker.autorun((c) => {
    if (loaded.get()) {
      c.stop()
      done()
    }
  })
}

describe(loadOnce.name, () => {
  it('loads an async fn, if not yet loaded', (done) => {
    const fn = async () => {}
    const loaded = loadOnce(fn)
    waitUntilDone(loaded, done)
  })
  it('returns the cached result, if already loaded', (done) => {
    const fn = async () => {}
    const loaded = loadOnce(fn)
    waitUntilDone(loaded, () => {
      const loaded2 = loadOnce(fn)
      expect(loaded2).to.equal(loaded)
      done()
    })
  })
  it('completes, even if an error occurred', (done) => {
    const fn = async () => {
      throw new Error()
    }
    const loaded = loadOnce(fn)
    waitUntilDone(loaded, done)
  })
  it('resolves the error into a callback', (done) => {
    const errorMessage = 'Expected erroor: some test terror occurred'
    const fn = async () => {
      throw new Error(errorMessage)
    }
    loadOnce(fn, {
      onError: (error) => {
        expect(error.message).to.equal(errorMessage)
        done()
      },
    })
  })
})
