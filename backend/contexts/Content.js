import { ContentServer } from '../api/remotes/ContentServer'
import { onServerExec } from '../infrastructure/arch/onServerExec'

/**
 * This is a context, providing methods that simply delegate code to the
 * ContentServer API.
 *
 * It acts as a bridge between the clients and the internal API and intends
 * to prevent direct access to such internals.
 */
export const Content = {
  name: 'content',
  methods: {}
}

/**
 * Used to fetch data for a given content-type (defined by name) and a given
 * set of ids.
 *
 * Restricts access by names (so client's can only fetch what's in their
 * whitelist).
 */
Content.methods.get = {
  name: 'content.methods.get',
  schema: ContentServer.schema(),
  run: onServerExec(function () {
    return function ({ name, ids }) {
      return ContentServer.get({ name, ids })
    }
  })
}


