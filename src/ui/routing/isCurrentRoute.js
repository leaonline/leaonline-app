import { Router } from "./Router";

export const isCurrentRoute = (name, { reactive = false } = {}) => {
    const current = Router.current({ reactive })
    console.debug(name, current)
    return current?.route?.name === name
}
