import { DocNotFoundError } from '../errors/DocNotFoundError'

export const ensureDocument = ({ name, document, docId, details }) => {
  if (typeof document === 'undefined' || document === null) {
    throw new DocNotFoundError('document.notFoundById', { name, docId, ...details })
  }
}
