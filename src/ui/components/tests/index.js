/* eslint-env mocha */
import '../../../startup/client/templates'
import '../../pages/loading/loading' // implied in app as well

describe('components', () => {
  require('../complete/tests/onComplete.tests')
  require('../container/tests/container.tests')
})
