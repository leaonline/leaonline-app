import { Dimension } from '../../../lib/contexts/Dimension'
import { stub, restoreAll } from '../../../__testHelpers__/stub'
import { simpleRandom } from '../../../__testHelpers__/simpleRandom'
import { loadMapData } from '../../../lib/screens/map/loadMapData'
import { toDocId } from '../../../lib/utils/array/toDocId'
import { mockCollection, resetCollection, restoreCollection } from '../../../__testHelpers__/mockCollection'
import { byDocId } from '../../../lib/utils/array/byDocId'
import { MapIcons } from '../../../lib/contexts/MapIcons'
import { Order } from '../../../lib/contexts/Order'
import { mockCall } from '../../../__testHelpers__/mockCall'

describe(loadMapData.name, () => {
  beforeAll(() => {
    mockCollection(Dimension)
    mockCollection(Order)
    mockCollection(MapIcons)
  })

  afterEach(() => {
    restoreAll()
    resetCollection(Dimension)
    resetCollection(Order)
    resetCollection(MapIcons)
  })

  afterAll(() => {
    restoreCollection(Dimension)
    restoreCollection(Order)
    restoreCollection(MapIcons)
  })

  it('returns an "empty" message if the server responded with no or faulty map data', async () => {
    const fieldDoc = { _id: simpleRandom() }
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

    mockCall((name, args, cb) => cb(undefined, allData[index++]))

    for (const input of allData) {
      const data = await loadMapData({ fieldDoc, input })
      expect(data).toEqual({ empty: true })
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
      dimensions: dimensions.map(doc => ({ _id: doc._id, maxProgress: 123, maxCompetencies: 456 })),
      levels: levels.map(toDocId),
      entries: [{}]
    }

    mockCall((name, args, cb) => setTimeout(() => cb(undefined, mapData)))

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

    let callCount = 0
    mockCall((name, args, cb) => {
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

    stub(MapIcons.collection(), 'findOne', () => ({
      fieldId: fieldDoc._id,
      icons: ['foo', 'bar']
    }))

    MapIcons.setField(fieldDoc._id)

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
          type: 'stage'
        },
        {
          type: 'milestone'
        }
      ]
    }
    mockCall((name, args, cb) => setTimeout(() => cb(undefined, mapData)))

    const { entries } = await loadMapData({ fieldDoc, loadUserData: null })

    // first
    expect(entries[0]).toEqual({
      type: 'start',
      entryKey: 'map-entry-0',
      viewPosition: {
        icon: 0,
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
        icon: 1,
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
        icon: 0, // index begins again at 0
        left: 'right2left',
        current: 'right',
        right: null
      }
    })

    // last
    expect(entries[6]).toEqual({
      type: 'finish',
      entryKey: 'map-entry-6',
      viewPosition: {
        current: 'center',
        left: 'right2left-down',
        right: 'fill'
      }
    })
  })
  test.todo('loads the map data with user progress added, if given')
  test.todo('updates the user data into the cached map')
})
