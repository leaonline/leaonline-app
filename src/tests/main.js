import { onClientExec, onServerExec } from '../utils/archUtils'
import 'meteor/aldeed:collection2/static'

onClientExec(() => {
  require('./client/main')
})

// The original backend suites require private settings and server-only APIs.
onServerExec(() => {
  require('./server/main')
})

// Shared utilities and PWA suites must be explicitly loaded by testModule.
import '../utils/object/tests/objectUtils.tests'
