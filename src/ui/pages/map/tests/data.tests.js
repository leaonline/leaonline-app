import { expect } from 'chai'
import { loadMapIcons } from '../data'

describe('learner map reference reads', function () {
  for (const document of [null, { fieldId: 'other', icons: ['book'] }, { fieldId: 'field', icons: 'book' }]) {
    it(`rejects an invalid loaded icon document: ${JSON.stringify(document)}`, async function () {
      let error
      try {
        await loadMapIcons('field', {
          call: async () => [{ _id: 'icons', fieldId: 'field' }],
          load: async () => document
        })
      }
      catch (e) { error = e }
      expect(error?.message).to.equal('map.iconsUnavailable')
    })
  }
  for (const boundary of ['call', 'load']) {
    it(`propagates rejected ${boundary} reads for the page fallback`, async function () {
      const failure = new Error('read failed')
      let error
      try {
        await loadMapIcons('field', {
          call: async () => {
            if (boundary === 'call') throw failure
            return [{ _id: 'icons', fieldId: 'field' }]
          },
          load: async () => { throw failure }
        })
      }
      catch (e) { error = e }
      expect(error).to.equal(failure)
    })
  }
  it('resolves the icon document ID through reference sync before loading', async function () {
    let query
    const icons = await loadMapIcons('field', {
      call: async ({ name, args }) => {
        expect(name.name).to.equal('syncState.methods.getDocs')
        expect(args).to.deep.equal({ name: 'mapIcons' })
        return [{ _id: 'different-id', fieldId: 'field' }]
      },
      load: async options => { query = options.query; return { fieldId: 'field', icons: ['book'] } }
    })
    expect(query).to.deep.equal({ _id: 'different-id' })
    expect(icons).to.deep.equal(['book'])
  })
  it('rejects absent or ambiguous editorial configuration without guessing', async function () {
    for (const documents of [[], [{ fieldId: 'field' }, { fieldId: 'field' }]]) {
      let error
      try { await loadMapIcons('field', { call: async () => documents }) }
      catch (e) { error = e }
      expect(error.message).to.equal('map.iconsUnavailable')
    }
  })
})
