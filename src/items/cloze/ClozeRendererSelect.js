import React, { useRef } from 'react'
import { Pressable, View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { ActionButton } from '../../components/ActionButton'
import Colors from '../../constants/Colors'
import { LeaText } from '../../components/LeaText'
import { Tooltip } from 'react-native-elements'
import { makeTransparent } from '../../styles/makeTransparent'
import { mergeStyles } from '../../styles/mergeStyles'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'

/**
 * Renders a pressable element that triggers a Modal dialog with
 * a select list.
 *
 * This enables us to avoid to use third-party components that have
 * an uncertain future of maintenance while at the same time stay
 * compatible for the native platforms.
 *
 * If the parent has triggered the "compare" state, users cannot
 * select anymore but view the correct solution if a failed score
 * has been detected for this select.
 *
 * @param props {object}
 * @param props.compare {object} compare state
 * @param props.compare.score {number}
 * @param props.compare.expected {string}
 * @param props.compare.actual {string}
 * @param props.compare.color {string}
 * @constructor
 */
export const ClozeRendererSelect = props => {
  const { color } = props
  const { Tts } = useTts()
  const { t } = useTranslation()
  const tooltipRef = useRef(null);

  const onSelect = (option, index) => {
    tooltipRef.current.toggleTooltip()
    setTimeout(() => {
      props.onSelect(option, index)
    }, 250)
  }

  const onActivate = () => {
    if (props.compare && props.compare.score === 1) {
      return // skip if result was correct
    }
    tooltipRef.current.toggleTooltip()
  }

  const label = props.value !== undefined && props.value !== null
    ? props.options[props.value]
    : ''

  const renderTooltipContent = () => {
    if (props.compare && props.compare.score !== 1) {
      return renderCorrectResponse()
    } else {
      return renderActions()
    }
  }

  const renderCorrectResponse = () => {
    const regExpBody = props.compare.expected.source
    const index = Number.parseInt(regExpBody, 10)
    const correct = props.options[index]
    return (
      <View style={styles.correctResponse}>
        <Tts text={t('item.correctResponse', { value: correct })} dontShowText={true} color={color} />
        <LeaText style={styles.correctText}>{correct}</LeaText>
      </View>
    )
  }

  const renderActions = () => {
    return props.options.map((option, index) => (
      <ActionButton
        key={index}
        text={option}
        color={color}
        block={true}
        onPress={() => onSelect(option, index)}
      />
    ))
  }

  const compareStyles = props.compare?.color ? { backgroundColor: props.compare.color } : undefined
  const pressStyles = mergeStyles(styles.select, compareStyles)

  return (
    <Tooltip
      ref={tooltipRef}
      height={props.options.length * 50}
      popover={<View style={styles.actionsContainer}>{renderTooltipContent()}</View>}
      withOverlay={true}
      withPointer={true}
      backgroundColor={Colors.dark}
      overlayColor={makeTransparent(Colors.white, 0.3)}
    >
      <Pressable style={pressStyles} onPress={onActivate}>
        <LeaText style={styles.label}>{label}</LeaText>
      </Pressable>
    </Tooltip>
  )
}

const styles = createStyleSheet({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2
    },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 5
  },
  select: {
    paddingLeft: 10,
    paddingRight: 10,
    minWidth: 50,
    minHeight: 36,
    backgroundColor: Colors.light,
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: '#F194FF'
  },
  buttonClose: {
    backgroundColor: '#2196F3'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center'
  },
  label: {
    lineHeight: 30
  },
  correctResponse: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  correctText: {
    fontWeight: 'bold',
    color: Colors.light
  }
})
