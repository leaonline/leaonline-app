import { onClientExec } from '../../../../utils/archUtils'

// shared tests
import './model.tests'
import './navigation.tests'
import './data.tests'

onClientExec(() => {
  require('./client/chooser.tests')
  require('./client/components.tests')

  // TODO: update page tests, once map page is complete
  // require('./client/page.tests')
})
