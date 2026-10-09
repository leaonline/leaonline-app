import { Template } from 'meteor/templating'
import { fadeIn } from '../../../utils/animationUtils'
import './container.html'

Template.container.onRendered(function () {
  const instance = this
  fadeIn('.lea-base-container', instance, (err, $target) => {
    if (err) {
      return console.error(err)
    }
    $target.data('visible', true)
  })
})
