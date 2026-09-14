/* eslint-env mocha */
import '../../../startup/client/templates'
import '../../pages/loading/loading' // implied in app as well

describe('components', function () {
  import '../complete/tests/onComplete.tests'
  import '../container/tests/container.tests'
})
