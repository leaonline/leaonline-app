import 'meteor/aldeed:collection2/static'
import { Meteor } from 'meteor/meteor'

// Shared utilities and PWA suites must be explicitly loaded by testModule.
import '../utils/object/tests/objectUtils.tests'
import '../ui/pages/map/tests'

if (Meteor.isClient) {
  require('../startup/client/routeHelpers')
}
// The original backend suites require private settings and server-only APIs.
if (Meteor.isServer) {
  require('./validateSchema')
  // api
  require('../api/accounts/tests')
  require('../api/collections/tests')
  require('../api/crypto/tests')
  require('../api/endpoints/tests')
  require('../api/errors/tests')
  require('../api/remotes/tests')
  require('../api/utils/tests')
  // contexts
  require('../contexts/achievements/tests')
  require('../contexts/competencies/tests')
  require('../contexts/connection/tests')
  require('../contexts/content/tests')
  require('../contexts/errors/tests')
  require('../contexts/map/tests')
  require('../contexts/progress/tests')
  require('../contexts/response/tests')
  require('../contexts/session/tests')
  require('../contexts/sync/tests')
  require('../contexts/users/tests')
  require('../contexts/feedback/tests')
  require('../contexts/legal/tests')
  require('../contexts/order/tests')
  require('../contexts/appraisal/tests')
  // infrastructure
  require('../infrastructure/factories/tests')
  require('../infrastructure/mixins/tests')
}
