export const createFakeIntersectionObserverTests = () => {
  const observers = []

  class FakeIntersectionObserver {
    constructor(callback) {
      this.callback = callback
      this.observed = []
      this.unobserved = []
      this.disconnectCalls = 0
      observers.push(this)
    }

    observe(target) {
      this.observed.push(target)
    }

    unobserve(target) {
      this.unobserved.push(target)
    }

    disconnect() {
      this.disconnectCalls += 1
    }
  }

  return { observers, FakeIntersectionObserver }
}
