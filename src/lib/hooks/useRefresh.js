import { useCallback, useState } from 'react'

/**
 * A little helper hook, that can be used to mediate between
 * {useDocs} and {BaseScreen} in order to implement a
 * page-refresh functionality.
 * @return {[number,(function(): void)|*]}
 */
export const useRefresh = () => {
  const [reload, setReload] = useState(0)
  const refresh = useCallback(() => {
    setReload(reload + 1)
  }, [reload])
  return [reload, refresh]
}