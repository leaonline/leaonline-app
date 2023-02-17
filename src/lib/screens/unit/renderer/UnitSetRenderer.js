import React, { useRef } from 'react'
import { ScrollView, View } from 'react-native'
import { ContentRenderer } from './ContentRenderer'
import { unitCardStyles } from './unitCardStyles'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Layout } from '../../../constants/Layout'

/**
 *
 * @param props {object}
 * @param props.unitSetDoc {object} the unitSet doc
 * @return {JSX.Element}
 * @constructor
 */
export const UnitSetRenderer = props => {
  const scrollViewRef = useRef()
  const { unitSetDoc, dimensionColor } = props

  return (
    <ScrollView ref={scrollViewRef} style={styles.scrollView} keyboardShouldPersistTaps='always'>
      <View style={[unitCardStyles, styles.dropShadow]}>
        <ContentRenderer
          elements={unitSetDoc.story}
          keyPrefix='unitSet'
          color={dimensionColor}
        />
      </View>
    </ScrollView>
  )
}

const styles = createStyleSheet({
  scrollView: {
    flexGrow: 1
  },
  dropShadow: Layout.dropShadow()
})
