/* eslint-env mocha */
import { expect } from 'chai'
import { Random } from 'meteor/random'
import { asyncHTTP } from '../asyncHTTP'
import { createUrl, urls } from '../../../../tests/webapp-server-helpers'
import { expectThrow } from '../../../../tests/helpers.tests'

describe(asyncHTTP.name, function () {
  it('throws an error on missing methods params', async function () {
    await expectThrow({
      fn: asyncHTTP,
      message: 'Match error: Expected string, got undefined in field method'
    })
  })

  it('throws an error on incompatible methods params', async function () {
    await expectThrow({
      fn: () => asyncHTTP('', Random.id()),
      message: 'Failed to execute \'open\' on \'XMLHttpRequest\': \'\' is not a valid HTTP method.'
    })
  })

  it('throws an error missing params', async function () {
    await expectThrow({
      fn: () => asyncHTTP('get'),
      message: 'Match error: Expected string, got undefined in field url'
    })
  })
  it('loads content as expected', async function () {
    const url = createUrl('manifest.json')
    const res = await asyncHTTP('get', url)

    expect(res.statusCode).to.equal(200)
    expect(res.headers['content-type']).to.equal('application/json; charset=utf-8')
    expect(res.data.short_name).equal('otu.lea')
  })
  it('responds with respective error message if expected', async function () {
    const url400 = createUrl(urls.path400)
    await expectThrow({
      fn: () => asyncHTTP('get', url400),
      message: 'failed [400] not found'
    })
  })
})
