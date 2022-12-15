import React from 'react'
import { render } from '@testing-library/react-native'
import { UnitContentElementFactory, useContentElementFactory } from '../../../components/factories/UnitContentElementFactory'
import { simpleRandom } from '../../../__testHelpers__/simpleRandom'
import { Text } from 'react-native'

describe('UnitContentElementFactory', () => {
  afterEach(() => UnitContentElementFactory.flush())

  describe(UnitContentElementFactory.register.name, () => {
    it('registers a new renderer', () => {
      const options = {
        type: simpleRandom(),
        subtype: simpleRandom(),
        component: simpleRandom()
      }
      const unknown = {
        type: simpleRandom(),
        subtype: simpleRandom(),
      }
      UnitContentElementFactory.register(options)
      expect(UnitContentElementFactory.isRegistered(options)).toEqual(true)
      expect(UnitContentElementFactory.isRegistered(unknown)).toEqual(false)
      UnitContentElementFactory.flush()
      expect(UnitContentElementFactory.isRegistered(options)).toEqual(false)
    })
  })
  describe(UnitContentElementFactory.Renderer.name, () => {
    it('renders by given keys', () => {
      const props = { testID: simpleRandom() }
      const text = simpleRandom()
      const Component = () => (<Text {...props}>{text}</Text> )
      const type = simpleRandom()
      const subtype = simpleRandom()
      const options = { type, subtype, component: Component }
      UnitContentElementFactory.register(options)

      const { Renderer } = useContentElementFactory()
      const { getAllByText } = render(<Renderer type={type} subtype={subtype} />)
      const elements = getAllByText(text)
      expect(elements.length).toEqual(1)
    })
    it('renders a fallback by unknown keys', () => {
      const type = simpleRandom()
      const subtype = simpleRandom()
      const text = `Fallback: ${type} / ${subtype}`
      const { Renderer } = useContentElementFactory()
      const { getAllByText } = render(<Renderer type={type} subtype={subtype} />)
      const elements = getAllByText(text)
      expect(elements.length).toEqual(1)
    })
  })
})
