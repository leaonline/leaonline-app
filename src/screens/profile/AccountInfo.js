import React, { useContext, useState } from 'react'
import { View, Modal } from 'react-native'
import { useTts } from '../../components/Tts'
import { useTranslation } from 'react-i18next'
import { ActionButton } from '../../components/ActionButton'
import { callMeteor } from '../../meteor/call'
import { createStyleSheet } from '../../styles/createStyleSheet'
import Colors from '../../constants/Colors'
import { AuthContext } from '../../contexts/AuthContext'
import { Layout } from '../../constants/Layout'
import { ErrorMessage } from '../../components/ErrorMessage'
import { mergeStyles } from '../../styles/mergeStyles'
import { Log } from '../../infrastructure/Log'

/**
 * Displays information and provides functionality about the user's account:
 *
 * - restore codes
 * - delete account
 * - soft-delete (dev-only)
 *
 * @return {*}
 * @constructor
 */
export const AccountInfo = (props) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [codes, setCodes] = useState([])
  const [error, setError] = useState(null)
  const { t } = useTranslation()
  const { Tts } = useTts()
  const { signOut, deleteAccount } = useContext(AuthContext)

  const onError = err => setError(err)
  const handleSignOut = () => signOut({ onError })
  const renderCodes = () => {
    if (!codes) { return null }
    return codes.map((code, index) => {
      const text = code.split('').join(' ')
      return (<Tts key={code} align='center' block fontStyle={styles.code} text={text} />)
    })
  }

  const requestRestoreCode = async () => {
    try {
      if (!codes?.length) {
        const restore = await callMeteor({ name: 'users.methods.getCodes', args: {} })
        setCodes(restore.split('-')) // TODO config via env
      }

      setModalVisible(true)
    }
    catch (e) {
      Log.error(e)
    }
  }

  const deleteMeteorAccount = () => deleteAccount({ onError })
  const containerStyle = mergeStyles(styles.container, props.containerStyle)

  return (
    <>
      <View style={containerStyle}>
        <Tts align='center'  text={t('accountInfo.title')} />
        <ActionButton icon='lock' text={t('accountInfo.restoreCodes')} onPress={requestRestoreCode} block />
        <ActionButton icon='sign-out-alt' text={t('accountInfo.signOut')} block onPress={handleSignOut} />
        <ActionButton icon='trash' text={t('accountInfo.delete')} onPress={deleteMeteorAccount} block />
        <ErrorMessage error={error} />
      </View>
      <Modal
        animationType='slide'
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
        style={styles.modal}
      >
        <View style={styles.modalBody}>
          <Tts align='center'  text={t('accountInfo.whyRestore')} block style={styles.modalInstructions} />
          <View style={styles.codes}>
            {renderCodes()}
          </View>
          <ActionButton icon='times' containerStyle={styles.modalClose} block text={t('actions.close')} onPress={() => setModalVisible(!modalVisible)} />
        </View>
      </Modal>
    </>
  )
}

const styles = createStyleSheet({
  container: Layout.container({ margin: 0 }),
  center: {
    borderWidth: 1,
    borderColor: Colors.danger
  },
  modalInstructions: {
    flex: 1
  },
  codes: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-around'
  },
  code: {
    fontWeight: 'bold',
    fontSize: 44,
    height: '100%',
    lineHeight: 88
  },
  modal: {},
  modalClose: {
    flex: 1
  },
  modalBody: {
    ...Layout.container()
  }
})
