import { Config } from '../env/Config'
import { useEffect, useState } from 'react'

export const useDevelopment = () => {
  const [isDevelopment, setIsDevelopment] = useState(false)
  const [isDeveloperRelease, setIsDeveloperRelease] = useState(false)
  const [isTest, setIsTest] = useState(false)

  useEffect(() => {
    setIsDevelopment(Config.isDevelopment)
    setIsDeveloperRelease(Config.isDeveloperRelease())
    setIsDeveloperRelease(Config.isTest())
  }, [])

  return { isDevelopment, isDeveloperRelease, isTest }
}
