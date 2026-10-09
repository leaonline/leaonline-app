import { DocNotFoundError } from '../errors/DocNotFoundError'

/**
 * Throws if a given document does not exist, including additional info
 * @param name {string=} additional contextual name
 * @param document {object=} the document to test
 * @param docId {string=} doc _id, if known, of the expected doc
 * @param details {object=} additional context information
 * @param logToConsole {boolean=} logs the error to the console, if desired
 */
export const ensureDocument = ({ name, document, docId, details, logToConsole }) => {
  if (typeof document === 'undefined' || document === null) {
    const e = new DocNotFoundError('document.notFoundById', { name, docId, ...details })

    if (logToConsole) {
      console.error(e)
    }

    throw e
  }
}
