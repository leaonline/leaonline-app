import React, { useRef } from 'react'
import { KeyboardTypes } from '../utils/KeyboardTypes'
import { TextInput, View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import Colors from '../../constants/Colors'
import { makeTransparent } from '../../styles/makeTransparent'
import { Tooltip } from 'react-native-elements'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { LeaText } from '../../components/LeaText'

/**
 * Renders a blanks, which is a free-text input specific to the Cloze item.
 *
 * @param props {object}
 * @param props.color {string} the current color to render
 * @param props.value {string} the entered value
 * @param props.original {string} the original expected value
 * @param props.onEndEditing {function} optional pattern that describes Keyboard
 * @param props.style {object=} optional custom styles definitions
 * @param props.isMultiline {boolean=false} indicate that this is a multiline
 *  text, that is used for sentences or long groups of words
 * @param props.compare {object=} optional compare object after entries were
 *  compared with correct response
 * @param props.compare.score {number=}
 * @param props.compare.color {number=}
 * @param props.pattern {string=} optional pattern that describes Keyboard
 *  behaviour
 * @return {JSX.Element}
 * @constructor
 */
export const ClozeRendererBlank = props => {
  const tooltipRef = useRef(null)
  const { t } = useTranslation()
  const { Tts } = useTts()
  const inputStyle = { ...styles.input }
  const {
    compare,
    color,
    original,
    pattern,
    value,
    isMultiline = false,
    onEndEditing,
    style
  } = props

  if (compare?.color) {
    inputStyle.backgroundColor = compare.color
    inputStyle.borderColor = compare.color
  }
  else {
    inputStyle.borderColor = color
  }

  if (style) {
    Object.assign(inputStyle, style)
  }

  const editable = !compare
  const maxLength = Math.floor(original.length * 1.5) // TODO configure 1.5 globally
  const keyboardType = KeyboardTypes.get(pattern)

  // TODO integrate custom keyboard for pattern-based input filter
  // https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/nativeComponentScreens/keyboardInput/demoKeyboards.js
  const renderInput = ({ onPressIn } = {}) => (
    <TextInput
      editable={editable}
      placeholderTextColor={color}
      selectionColor={color}
      value={value}
      // prevent various type assistance functionalities
      autoCorrect={false}
      autoCapitalize="none"
      contextMenuHidden={true}
      importantForAutofill="no" // android
      textContentType="none" // ios
      spellCheck={false}
      // appearance
      maxLength={maxLength}
      multiline={isMultiline}
      blurOnSubmit
      style={inputStyle}
      // selectionColor
      // keyboard
      returnKeyType="done"
      keyboardType={keyboardType}
      // events
      onPressIn={onPressIn}
      onEndEditing={onEndEditing}
    />
  )

  if (compare && compare.score !== 1) {
    const openTooltip = () => {
      tooltipRef.current.toggleTooltip()
    }

    const renderTooltipContent = () => {
      return (
        <View style={styles.correctResponse}>
          <Tts text={t('item.correctResponse', { value: original })} dontShowText={true} color={color}/>
          <LeaText style={styles.text}>{original}</LeaText>
        </View>
      )
    }

    return (
      <Tooltip
        ref={tooltipRef}
        height={100}
        popover={<View style={styles.actionsContainer}>{renderTooltipContent()}</View>}
        withOverlay={true}
        withPointer={true}
        backgroundColor={Colors.dark}
        overlayColor={makeTransparent(Colors.white, 0.3)}
      >
        {renderInput({ onPressIn: openTooltip })}
      </Tooltip>
    )
  }

  // otherwise just render the input
  return renderInput()
}

const styles = createStyleSheet({
  input: {
    padding: 5,
    fontSize: 18,
    fontFamily: 'semicolon',
    color: Colors.dark,
    backgroundColor: '#fff',
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4
  },
  correctResponse: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontWeight: 'bold',
    color: Colors.light
  }
})
