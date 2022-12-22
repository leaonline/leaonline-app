import { MeteorLoginStorage } from './MeteorLoginStorage'

/**
 * Returns, whether a login is currently securely stored on the devices
 * @return {Promise<boolean>} true/false
 */
export const hasLogin = async () => MeteorLoginStorage.hasLogin()
