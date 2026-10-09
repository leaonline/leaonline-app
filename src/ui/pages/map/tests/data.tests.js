import { expect } from 'chai'
import { loadMapIcons } from '../data'

describe('learner map reference reads', function () {
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
