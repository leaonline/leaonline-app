import Meteor from '@meteorrn/core'
import { Dimension } from '../../../contexts/Dimension'
import { stub, restoreAll } from '../../../__testHelpers__/stub'
import { simpleRandom } from '../../../__testHelpers__/simpleRandom'
import { loadMapData } from '../../../screens/map/loadMapData'
import { toDocId } from '../../../utils/toDocId'
import { mockCollection, resetCollection, restoreCollection } from '../../../__testHelpers__/mockCollection'
import { byDocId } from '../../../utils/byDocId'
import { MapIcons } from '../../../screens/map/MapIcons'

MapIcons.register(() => null)
MapIcons.register(() => null)
MapIcons.register(() => null)

describe(loadMapData.name, () => {
  beforeAll(() => {
    mockCollection(Dimension)
  })

  afterEach(() => {
    restoreAll()
    resetCollection(Dimension)
  })

  afterAll(() => {
    restoreCollection(Dimension)
  })

  it('returns null if the server responded with no or faulty map data', async () => {
    const fieldDoc = { _id: simpleRandom() }
    stub(Meteor, 'status', () => ({ connected: true }))

    const allData = [
      undefined,
      null,
      {},
      { dimensions: [{}] },
      { dimensions: [{}], entries: [{}] },
      { levels: [{}], entries: [{}] },
      { dimensions: [{}], levels: [{}] }
    ]

    let index = 0
    stub(Meteor, 'call', (name, args, cb) => cb(undefined, allData[index++]))

    for (const input of allData) {
      const data = await loadMapData({ fieldDoc, input })
      expect(data).toEqual(null)
    }
  })

  it('loads the map data without user progress', async () => {
    const fieldDoc = { _id: simpleRandom(), title: simpleRandom() }
    const dimensions = [
      { _id: simpleRandom(), title: simpleRandom(), shortCode: 'R' },
      { _id: simpleRandom(), title: simpleRandom(), shortCode: 'W' }
    ]

    const DimensionCollection = Dimension.collection()

    stub(DimensionCollection, 'findOne', (_id) => {
      return dimensions.find((byDocId(_id)))
    })

    const levels = [
      { _id: simpleRandom() },
      { _id: simpleRandom() }
    ]

    const mapData = {
      dimensions: dimensions.map(toDocId),
      levels: levels.map(toDocId),
      entries: [{}]
    }
    stub(Meteor, 'status', () => ({ connected: true }))
    stub(Meteor, 'call', (name, args, cb) => setTimeout(() => cb(undefined, mapData)))

    const data = await loadMapData({ fieldDoc, loadUserData: null })
    expect(data.fieldName).toEqual(fieldDoc.title)
    expect(data.dimensionsResolved).toEqual(true)
    expect(data.dimensions).toEqual(dimensions)
    expect(data.levels).toEqual(levels.map(toDocId))
  })

  it('caches the map, once loaded', async () => {
    const fieldDoc = { _id: simpleRandom(), title: simpleRandom() }
    const dimensions = [
      { _id: simpleRandom(), title: simpleRandom(), shortCode: 'R' },
      { _id: simpleRandom(), title: simpleRandom(), shortCode: 'W' }
    ]

    const DimensionCollection = Dimension.collection()

    stub(DimensionCollection, 'findOne', (_id) => {
      return dimensions.find((byDocId(_id)))
    })

    const levels = [
      { _id: simpleRandom() },
      { _id: simpleRandom() }
    ]

    const mapData = {
      viewElementsAdded: false,
      dimensionsResolved: false,
      dimensions: dimensions.map(toDocId),
      levels: levels.map(toDocId),
      entries: [{}]
    }
    stub(Meteor, 'status', () => ({ connected: true }))

    let callCount = 0
    stub(Meteor, 'call', (name, args, cb) => {
      callCount++
      mapData.viewElementsAdded = true
      mapData.dimensionsResolved = true
      setTimeout(() => cb(undefined, mapData))
    })

    const data1 = await loadMapData({ fieldDoc, loadUserData: null })
    const data2 = await loadMapData({ fieldDoc, loadUserData: null })
    expect(callCount).toEqual(1)
    expect(data1).toEqual(data2)
  })

  it('adds additional rendering information to the entries', async () => {
    const fieldDoc = { _id: simpleRandom(), title: simpleRandom() }
    const dimensions = [
      { _id: simpleRandom(), title: simpleRandom(), shortCode: 'R' },
      { _id: simpleRandom(), title: simpleRandom(), shortCode: 'W' }
    ]

    const DimensionCollection = Dimension.collection()

    stub(DimensionCollection, 'findOne', (_id) => {
      return dimensions.find((byDocId(_id)))
    })

    const levels = [
      { _id: simpleRandom() },
      { _id: simpleRandom() }
    ]

    const mapData = {
      dimensions: dimensions.map(toDocId),
      levels: levels.map(toDocId),
      entries: [
        {
          type: 'stage'
        },
        {
          type: 'stage'
        },
        {
          type: 'milestone'
        },
        {
          type: 'stage'
        },
        {
          type: 'milestone'
        }
      ]
    }
    stub(Meteor, 'status', () => ({ connected: true }))
    stub(Meteor, 'call', (name, args, cb) => setTimeout(() => cb(undefined, mapData)))

    const { entries } = await loadMapData({ fieldDoc, loadUserData: null })

    // first
    expect(entries[0]).toEqual({
      type: 'start',
      entryKey: 'map-entry-0',
      viewPosition: {
        current: 'center',
        left: 'fill',
        right: 'left2right-up'
      }
    })

    // when next is a stage then
    // we display a connector on the opposite
    // side of the entry
    expect(entries[1]).toEqual({
      type: 'stage',
      entryKey: 'map-entry-1',
      label: 1,
      viewPosition: {
        icon: 0,
        left: 'right2left',
        current: 'right',
        right: null
      }
    })

    // when next is not stage then there
    // are no connectors and no icon
    expect(entries[2]).toEqual({
      type: 'stage',
      entryKey: 'map-entry-2',
      label: 2,
      viewPosition: {
        icon: -1,
        left: null,
        current: 'left',
        right: null
      }
    })

    // milestones are always centered
    expect(entries[3]).toEqual({
      type: 'milestone',
      entryKey: 'map-entry-3',
      viewPosition: {
        left: 'right2left-down',
        current: 'center',
        right: 'left2right-up'
      }
    })

    // another stage
    expect(entries[4]).toEqual({
      type: 'stage',
      entryKey: 'map-entry-4',
      label: 3,
      viewPosition: {
        icon: -1,
        left: null,
        current: 'right',
        right: null
      }
    })

    // last
    expect(entries[5]).toEqual({
      type: 'finish',
      entryKey: 'map-entry-5',
      viewPosition: {
        current: 'center',
        left: 'fill',
        right: 'left2right-down'
      }
    })
  })
  test.todo('loads the map data with user progress added, if given')
  test.todo('updates the user data into the cached map')
})
