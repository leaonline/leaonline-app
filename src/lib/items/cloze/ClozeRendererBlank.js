import React, { useEffect, useRef, useState } from 'react'
import { KeyboardTypes } from '../utils/KeyboardTypes'
import { Pressable, SafeAreaView, StatusBar, TextInput, View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { Colors } from '../../constants/Colors'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { LeaText } from '../../components/LeaText'
import { useKeyboardVisibilityHandler } from '../../hooks/useKeyboardVisibilityHandler'
import { Layout } from '../../constants/Layout'
import Tooltip from 'react-native-walkthrough-tooltip'
/**
 * Renders a blanks, which is a free-text input specific to the Cloze item.
 *
 * @param props {object}
 * @param props.color {string} the current color to render
 * @param props.original {string} the original expected value
 * @param props.onSubmit {function} sends text to parent component
 * @param props.style {object=} optional custom styles definitions
 * @param props.isMultiline {boolean=} indicate that this is a multiline
 *  text, that is used for sentences or long groups of words
 * @param props.compare {object=} optional compare object after entries were
 *  compared with correct response
 * @param props.compare.score {number=}
 * @param props.compare.color {number=}
 * @param props.compare.hasNext {boolean=}
 * @param props.pattern {string=} optional pattern that describes Keyboard
 *  behaviour
 * @return {JSX.Element}
 * @component
 */
export const ClozeRendererBlank = props => {
  const [showTooltip, setShowTooltip] = useState(false)
  const { t } = useTranslation()
  const { Tts } = useTts()
  const [value, setValue] = useState('')
  const [editActive, setEditActive] = useState(false)
  const inputStyle = { ...styles.input }
  const {
    blanksId,
    compare,
    color,
    original,
    pattern,
    hasPrefix,
    hasSuffix,
    isMultiline = false,
    onSubmit,
    style
  } = props

  // if the unique-ish id changes we can assume
  // this input is now part of a new page or unit
  // and thus we flush it's internal text state
  useEffect(() => {
    setValue(null)
  }, [blanksId])

  let textAlign = 'center'

  if (hasPrefix && !hasSuffix) {
    textAlign = 'left'
  }
  if (hasSuffix && !hasPrefix) {
    textAlign = 'right'
  }

  const activateEdit = () => {
    setEditActive(true)
  }

  useKeyboardVisibilityHandler(({ status }) => {
    if (status === 'hidden' && editActive) {
      setEditActive(false)
      handleSubmit()
    }
  })

  const handleBlur = () => {
    setEditActive(false)
  }
  const handleSubmit = () => {
    onSubmit(value)
  }

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
  const renderInput = ({ onPressIn } = {}) => {
    return (
      <TextInput
        accessibilityLabel='text'
        accessibilityHint='text'
        editable={editable}
        placeholderTextColor={color}
        selectionColor={color}
        value={value}
        // prevent various type assistance functionalities
        autoCorrect={false}
        autoCapitalize='none'
        contextMenuHidden
        importantForAutofill='no' // android
        textContentType='none' // ios
        spellCheck={false}
        // appearance
        multiline={isMultiline}
        maxLength={maxLength}
        blurOnSubmit
        style={inputStyle}
        textAlign={textAlign}
        // selectionColor
        // keyboard
        returnKeyType={props.hasNext ? 'next' : 'done'}
        keyboardType={keyboardType}
        // events
        onPressIn={onPressIn ?? activateEdit}
        onChangeText={setValue}
        onEndEditing={handleSubmit}
        onBlur={handleBlur}
      />
    )
  }

  if (compare) {
    const ToolTipContent = React.forwardRef(() => {
      return (
        <View style={styles.correctResponse}>
          <Tts text={t('item.correctResponse', { value: original })} dontShowText color={color} />
          <LeaText style={styles.text}>{original}</LeaText>
        </View>
      )
    })

    //return renderInput({ onPressIn: openTooltip })
    const width = 150 + original.length * 6
    const maxWidth = Layout.width() - 20 // incl. padding
    const widthExceeded = width > maxWidth
    const finalWidth = widthExceeded
      ? maxWidth
      : width
    const height = widthExceeded
      ? 150
      : 100
    const contentStyle = { width: finalWidth, height }

    return (
      <Tooltip
        isVisible={showTooltip}
        content={<ToolTipContent />}
        placement="top"
        showChildInTooltip={false}
        tooltipStyle={styles.tooltip}
        contentStyle={[styles.tooltipContent, contentStyle]}
        topAdjustment={-StatusBar.currentHeight}
        onClose={() => setShowTooltip(false)}
      >
        <Pressable onPress={() => setShowTooltip(!showTooltip)}>
          {renderInput({ onPressIn: () => {}})}
        </Pressable>
      </Tooltip>
    )
  }

  // otherwise just render the input
  return renderInput()
}

const styles = createStyleSheet({
  input: {
    ...Layout.input(),
    maxWidth: '85%',
    minWidth: 40,
    margin: 0
  },
  correctResponse: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    fontWeight: 'bold',
    color: Colors.light,
    flex: 1,
    marginLeft: 10
  },
  actionsContainer: {
    flex: 1,
    flexGrow: 1
  },
  tooltip: {},
  tooltipContent: {
    flex: 1,
    flexGrow: 1,
    width: 200,
    backgroundColor: Colors.dark,
    ...Layout.dropShadow()
  },
  inputWrap: {}
})
