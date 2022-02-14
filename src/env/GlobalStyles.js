import { Config } from './Config'
import { createStyleSheet} from "../styles/createStyleSheet"

export const GlobalStyles = createStyleSheet({
    container: {
        flex: 1,
        alignItems: 'center',
        margin: Config.styles.containerMargin
    },
    body: {
        flex: 2,
        flexDirection: 'row'
    },
    navigationButtons: {
        flexDirection: 'row'
    },
    routeButtonContainer: {
        width: '100%',
        flex: 1,
        alignItems: 'center'
    }
})



