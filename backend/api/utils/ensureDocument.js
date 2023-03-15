import { DocNotFoundError } from '../errors/DocNotFoundError'

export const ensureDocument = ({ name, document, docId, details }) => {
  if (typeof document === 'undefined' || document === null) {
    const e = new DocNotFoundError('document.notFoundById', { name, docId, ...details })
    console.error(e)
    throw e
  }
}
