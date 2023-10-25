import React from 'react'
import { MapIcons } from '../../lib/contexts/MapIcons'
import { createContextBaseTests } from '../../__testHelpers__/createContextBaseTests'
import { simpleRandomHex } from '../../lib/utils/simpleRandomHex'
import renderer from 'react-test-renderer';

describe(MapIcons.name, () => {
  createContextBaseTests({ ctx: MapIcons })

  describe(MapIcons.getIncrementalIconIndex.name, () => {
    it('always returns -1 if no icons are registered', () => {
      MapIcons.setField(simpleRandomHex())
      expect(MapIcons.getIncrementalIconIndex()).toBe(-1)
    })
    it('returns a count that rotates around the icons set size', async () => {
      const fieldId = simpleRandomHex()
      await MapIcons.collection().insert({
        fieldId,
        icons: ['foo', 'bar', 'baz']
      })

      MapIcons.setField(fieldId)

      const size = MapIcons.size()
      expect(size).toBe(3)

      let prev = -1
      for (let i = 0; i < size; i++) {
        const count = MapIcons.getIncrementalIconIndex()
        expect(count).toBeGreaterThan(prev)
        prev = count
      }
      // expect reset
      expect(MapIcons.getIncrementalIconIndex()).toBe(0)
    })
  })
  describe(MapIcons.render.name, () => {
    it('returns null if the index is not within bounds', async () => {
      const fieldId = simpleRandomHex()
      const icons = ['edit', 'check', 'times']
      await MapIcons.collection().insert({ fieldId, icons })
      ;[-3, -2, -1, 3, 4, 5].forEach(index => {
        expect(MapIcons.render(index))
          .toBe(null)
      })
    })
    it('renders an icon by given index', async () => {
      const fieldId = simpleRandomHex()
      const icons = ['edit', 'check', 'times']
      await MapIcons.collection().insert({ fieldId, icons })

      MapIcons.setField(fieldId)
      const size = MapIcons.size()

      for (let i = 0; i < size; i++) {
        const MapIcon = MapIcons.render(i)
        const component = renderer.create(MapIcon);
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
      }
    })
  })
})
