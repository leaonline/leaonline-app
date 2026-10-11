import { Template } from 'meteor/templating'
import { fadeIn } from '../../../utils/animationUtils'
import './container.html'

Template.container.onRendered(function () {
  fadeIn('.lea-base-container', this, (err, $target) => {
    if (err) {
      return console.error(err)
    }
    $target.data('visible', true)
  })
})
