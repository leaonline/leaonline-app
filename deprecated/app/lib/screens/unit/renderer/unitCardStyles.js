import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Layout } from '../../../constants/Layout'
import { Colors } from '../../../constants/Colors'

const styles = createStyleSheet({
  unitCard: {
    ...Layout.container(),
    margin: 0,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 5,
    borderColor: Colors.white,
    overflow: 'visible',
    marginTop: 2,
    marginBottom: 10,
    marginLeft: 4,
    marginRight: 4
  }
})

export const unitCardStyles = styles.unitCard
