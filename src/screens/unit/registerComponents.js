import { UnitContentElementFactory } from '../../components/factories/UnitContentElementFactory'
import { PlainText } from '../../components/renderer/text/PlainText'
import { LazyImage } from '../../components/renderer/media/LazyImage'

UnitContentElementFactory.register({
  type: 'text',
  subtype: 'text',
  component: PlainText
})

UnitContentElementFactory.register({
  type: 'media',
  subtype: 'image',
  component: LazyImage
})
