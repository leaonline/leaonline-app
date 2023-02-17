import React, { useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { createStyleSheet } from '../../styles/createStyleSheet'
import { ActionButton } from '../../components/ActionButton'
import { Colors } from '../../constants/Colors'
import { LeaText } from '../../components/LeaText'
import { Tooltip } from 'react-native-elements'
import { makeTransparent } from '../../styles/makeTransparent'
import { mergeStyles } from '../../styles/mergeStyles'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { Layout } from '../../constants/Layout'

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
 * @param props.compare.score {object}
 * @param props.compare.score {number}
 * @param props.compare.entries {[object]}
 * @param props.compare.actual {string}
 * @param props.compare.color {string}
 * @constructor
 */
export const ClozeRendererSelect = props => {
  const { Tts } = useTts()
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState(false)
  const tooltipRef = useRef(null)

  const { color } = props
  const height = props.options.length * 70 // calculate if we have a vertical overflow
  const isOverflow = Layout.withRatio(height) > (Layout.height() * 0.4)
  const showCompare = !!props.compare
  const label = props.value !== undefined && props.value !== null
    ? props.options[props.value]
    : ''

  const onSelect = (option, index) => {
    if (isOverflow) {
      setModalVisible(false)
    }
    else {
      tooltipRef.current.toggleTooltip()
    }

    setTimeout(() => {
      props.onSelect(option, index)
    }, 250)
  }

  const onActivate = () => isOverflow
    ? setModalVisible(true)
    : tooltipRef.current.toggleTooltip()

  const renderTooltipContent = () => showCompare
    ? renderScoreResult()
    : renderActions()

  const renderScoreResult = () => {
    const expected = props.compare.entries[0]?.correctResponse

    if (!expected) {
      return null // TODO how can we handle this situation?
    }

    const regExpBody = expected.source.replace(/\D+/g, '')
    const index = Number.parseInt(regExpBody, 10)
    const correct = props.options[index]

    return (
      <View style={styles.correctResponse}>
        <Tts text={t('item.correctResponse', { value: correct })} dontShowText color={color} />
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
        block
        align='center'
        containerStyle={styles.actionButton}
        onPress={() => onSelect(option, index)}
      />
    ))
  }

  const compareStyles = props.compare?.color ? { backgroundColor: props.compare.color } : undefined
  const pressStyles = mergeStyles(styles.select, compareStyles)
  const longest = props.options.reduce((a, b) => a + b.length, 0)

  // if our answers exceed half of the screen we need
  // to display a model instead of a tooltip
  if (isOverflow) {
    return (
      <>
        <Modal
          animationType='slide'
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          style={styles.modal}
        >
          <ScrollView persistentScrollbar contentContainerStyle={styles.modalBackground}>
            <View style={styles.modalCenteredView}>
              <View style={styles.modalView}>
                {renderTooltipContent()}
              </View>
            </View>
          </ScrollView>
        </Modal>
        <Pressable accessibilityRole='button' style={pressStyles} onPress={onActivate}>
          <LeaText style={styles.label}>{label}</LeaText>
        </Pressable>
      </>
    )
  }

  return (
    <Tooltip
      ref={tooltipRef}
      height={height}
      width={150 + longest * 6}
      popover={<View style={styles.actionsContainer}>{renderTooltipContent()}</View>}
      withOverlay
      withPointer
      backgroundColor={Colors.dark}
      containerStyle={styles.tooltipContainer}
      overlayColor={makeTransparent(Colors.white, 0.6)}
    >
      <Pressable accessibilityRole='button' style={pressStyles} onPress={onActivate}>
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
    margin: 15,
    backgroundColor: Colors.dark,
    borderRadius: 20,
    padding: 15,
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
  tooltipContainer: {

  },
  actionsContainer: {
    width: '100%',
    height: '100%'
  },
  modalBackground: {
    backgroundColor: 'transparent'
  },
  modalCenteredView: {

  },
  select: {
    minWidth: 50,
    minHeight: 36,
    backgroundColor: Colors.light,
    alignItems: 'center',
    borderColor: Colors.dark,
    borderWidth: 0.5,
    borderRadius: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  actionButton: {
    marginBottom: 5
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
  modal: {

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
    flexGrow: 1,
    marginLeft: 3,
    fontWeight: 'bold',
    color: Colors.light,
  }
})
