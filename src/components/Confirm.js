import React, { useState } from 'react'
import { View, Modal } from 'react-native'
import { ActionButton } from './ActionButton'
import { createStyleSheet } from '../styles/createStyleSheet'
import { TTSengine } from './Tts'

const Tts = TTSengine.component()

export const Confirm = props => {
  const [modalOpen, setModalOpen] = useState(false)
  const { onApprove, onDeny, ...fordwardedProps } = props

  const renderQuestion = () => {
    if (!props.question) { return null }
    return (<Tts style={styles.modalText} text={props.question} />)
  }

  const onResponse = (targetFn) => {
    setModalOpen(false)
    setTimeout(() => {
      console.debug('response', targetFn)
      if (targetFn) targetFn()
    }, 250)
  }

  const renderIcon = () => {
    if (props.noConfirm) {
      return <ActionButton {...fordwardedProps} onPress={() => onResponse(onApprove)} />
    } else {
      return <ActionButton {...fordwardedProps} onPress={() => setModalOpen(true)} />
    }
  }

  const renderApprove = () => (<ActionButton text={props.approveText} onPress={() => onResponse(onApprove)} />)
  const renderDeny = () => (<ActionButton text={props.denyText} onPress={() => onResponse(onDeny)} />)

  return (
    <>
      <Modal
        animationType='fade'
        transparent={false}
        visible={modalOpen}
        onRequestClose={() => { setModalOpen(!false) }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {renderQuestion()}

            <View style={styles.footer}>
              {renderApprove()}
              {renderDeny()}
            </View>
          </View>
        </View>
      </Modal>
      {renderIcon()}
    </>
  )
}

/**
 * Allows to trigger a confirm-modal by given id from outside of a render
 * cycle.
 * @param id
 */
Confirm.triggerById = id => {
  console.debug('trigger by id', id)
}

const styles = createStyleSheet({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  footer: {
    width: '100%',
    height: '50%'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: '5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center'
  }
})
