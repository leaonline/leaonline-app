import React from 'react'
import { useContentElementFactory } from '../../../components/factories/UnitContentElementFactory'
import { createStyleSheet } from '../../../styles/createStyleSheet'

/**
 *  This is the generic content rendering component, which
 *  applies to all content structure across units and unitSets
 *  with their story pages.
 *  Rendering of the elements is delegated to their respective
 *  registered renderer using the {UnitContentElementFactory}
 *
 *  @param props {object}
 *  @param props.elements {object[]=}
 *  @param props.keyPrefix {string}
 *  @param props.dimensionColor {string}
 *  @param props.submitResponse {function=}
 *  @param props.showCorrectResponse {boolean=}
 *  @param props.scoreResult {*=}
 *  @return {JSX.Element}
 *  @component
 **/
export const ContentRenderer = props => {
  const { Renderer } = useContentElementFactory()
  const { elements, keyPrefix, dimensionColor, submitResponse, showCorrectResponse, scoreResult } = props
  if (!elements?.length) { return null }

  return elements.map((element, index) => {
    const key = `${keyPrefix}-${index}`
    const elementData = { ...element }

    elementData.dimensionColor = dimensionColor
    elementData.uid = key

    // item elements are "interactive" beyond tts
    // and require their own view and handlers
    if (element.type === 'item') {
      elementData.submitResponse = submitResponse
      elementData.showCorrectResponse = showCorrectResponse
      elementData.scoreResult = showCorrectResponse && scoreResult
    }

    // all other elements are simply "display" elements
    return (
      <Renderer
        key={elementData.uid}
        style={styles.contentElement}
        {...elementData}
      />
    )
  })
}

const styles = createStyleSheet({
  contentElement: {
    margin: 5
  }
})