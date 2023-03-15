import React, { useContext, useMemo, useState } from 'react'
import { View, Modal, ScrollView } from 'react-native'
import { useTts } from '../../../components/Tts'
import { useTranslation } from 'react-i18next'
import { ActionButton } from '../../../components/ActionButton'
import { createStyleSheet } from '../../../styles/createStyleSheet'
import { Colors } from '../../../constants/Colors'
import { AuthContext } from '../../../contexts/AuthContext'
import { Layout } from '../../../constants/Layout'
import { ErrorMessage } from '../../../components/ErrorMessage'
import { mergeStyles } from '../../../styles/mergeStyles'
import { RequestRestoreCodes } from './RequestRestoreCodes'
import { InteractionGraph } from '../../../infrastructure/log/InteractionGraph'
import { useDocs } from '../../../meteor/useDocs'
import { loadAccountData } from './loadAccountData'
import { Markdown } from '../../../components/MarkdownWithTTS'

/**
 * Displays information and provides functionality about the user's account:
 *
 * - restore codes
 * - delete account
 * - soft-delete (dev-only)
 *
 * @return {*}
 * @component
 */
export const AccountInfo = (props) => {
  const [modalContent, setModalContent] = useState(null)
  const [error, setError] = useState(null)
  const { signOut, deleteAccount } = useContext(AuthContext)
  const docs = useDocs({
    fn: loadAccountData
  })
  const { t } = useTranslation()
  const { Tts } = useTts()

  const buttons = useMemo(() => {
    const onError = err => setError(err)
    const actions = {}

    /**
     * Fetches restore codes from server and displays
     * them in a readable way.
     */
    actions.restore = {
      key: 'restore',
      icon: 'lock',
      label: () => t('accountInfo.restore.title'),
      onPress: () => {
        InteractionGraph.action({
          target: `${AccountInfo.name}:restoreModal`,
          type: 'opened'
        })
        setModalContent(actions.restore.modal)
      },
      modal: {
        instructions: () => t('accountInfo.restore.instructions'),
        body: () => (<RequestRestoreCodes onError={onError} />),
        deny: {
          icon: 'times',
          label: () => t('actions.close'),
          handler: () => {
            InteractionGraph.action({
              target: `${AccountInfo.name}:restoreModal`,
              type: 'closed'
            })
            setModalContent(null)
          }
        }
      }
    }

    /**
     * If user accepts the dialog then she will be signed out.
     * Will contain a warning to note restore codes!
     */
    actions.signOut = {
      key: 'signOut',
      icon: 'sign-out-alt',
      label: () => t('accountInfo.signOut.title'),
      onPress: () => setModalContent(actions.signOut.modal),
      modal: {
        instructions: () => t('accountInfo.signOut.instructions'),
        approve: {
          icon: 'sign-out-alt',
          label: () => t('accountInfo.signOut.title'),
          handler: () => signOut({ onError })
        },
        deny: {
          icon: 'times',
          label: () => t('actions.cancel'),
          handler: () => setModalContent(null)
        }
      }
    }
    actions.deleteAccount = {
      icon: 'trash',
      key: 'deleteAccount',
      label: () => t('accountInfo.deleteAccount.title'),
      onPress: () => setModalContent(actions.deleteAccount.modal),
      modal: {
        instructions: () => t('accountInfo.deleteAccount.instructions'),
        approve: {
          icon: 'sign-out-alt',
          label: () => t('accountInfo.deleteAccount.title'),
          handler: () => deleteAccount({ onError })
        },
        deny: {
          icon: 'times',
          label: () => t('actions.cancel'),
          handler: () => setModalContent(null)
        }
      }
    }

    actions.privacy = {
      icon: 'shield-alt',
      key: 'privacy',
      label: () => t('legal.privacy'),
      onPress: () => setModalContent(actions.privacy.modal),
      modal: {
        scrollable: true,
        body: () => {
          return (
            <Markdown value={docs.data.legal.privacy} />
          )
        },
        deny: {
          icon: 'times',
          label: () => t('actions.close'),
          handler: () => setModalContent(null)
        }
      }
    }

    actions.terms = {
      icon: 'handshake',
      key: 'terms',
      label: () => t('legal.terms'),
      onPress: () => setModalContent(actions.terms.modal),
      modal: {
        scrollable: true,
        body: () => {
          return (
            <Markdown value={docs.data.legal.terms} />
          )
        },
        deny: {
          icon: 'times',
          label: () => t('actions.close'),
          handler: () => setModalContent(null)
        }
      }
    }

    actions.imprint = {
      icon: 'certificate',
      key: 'imprint',
      label: () => t('legal.imprint'),
      onPress: () => setModalContent(actions.imprint.modal),
      modal: {
        scrollable: true,
        body: () => {
          return (
            <Markdown value={docs.data.legal.imprint} />
          )
        },
        deny: {
          icon: 'times',
          label: () => t('actions.close'),
          handler: () => setModalContent(null)
        }
      }
    }


    return Object.values(actions)
  }, [docs.data])

  const handlePress = (fn) => () => fn()
  const containerStyle = mergeStyles(styles.container, props.containerStyle)
  const renderModal = () => {
    const visible = !!modalContent
    const content = modalContent ?? {}

    const renderModalContent = () => (
      <View style={styles.modalContent}>
        {content.instructions && (<Tts align='flex-start' text={content.instructions()} block style={styles.modalInstructions} />)}
        {content.body ? content.body() : null}
      </View>
    )

    return (
      <Modal
        animationType='slide'
        transparent={false}
        visible={visible}
        onRequestClose={() => setModalContent(null)}
        style={styles.modal}
      >
        <View style={styles.modalBody}>
          {
            content.scrollable
              ? (
                <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true}>
                  {renderModalContent()}
                </ScrollView>
              )
              : renderModalContent()
          }
          <View style={styles.actions}>
            {content.approve && (
              <ActionButton
                icon={content.approve.icon}
                containerStyle={styles.actionButton}
                block
                text={content.approve.label()}
                onPress={handlePress(modalContent.approve.handler)}
              />
            )}
            {content.deny && (
              <ActionButton
                icon={content.deny.icon}
                containerStyle={styles.actionButton}
                block
                text={content.deny.label()}
                onPress={handlePress(modalContent.deny.handler)}
              />
            )}
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <>
      <View style={containerStyle}>
        {buttons && buttons.map(definitions => {
          return (
            <ActionButton
              key={definitions.key}
              icon={definitions.icon}
              text={definitions.label()}
              onPress={handlePress(definitions.onPress)}
              containerStyle={styles.actionButton}
              block
            />
          )
        })}
        <ErrorMessage error={error} />
      </View>
      {renderModal()}
    </>
  )
}

const styles = createStyleSheet({
  container: Layout.container({ margin: 0 }),
  center: {
    borderWidth: 1,
    borderColor: Colors.danger
  },
  modalInstructions: {},
  modal: {
    backgroundColor: Colors.danger
  },
  modalBody: {
    ...Layout.container({ margin: 0 }),
    padding: 20,
    alignItems: 'stretch',
    justifyItems: 'stretch',
    justifyContent: 'space-around',
    backgroundColor: Colors.light
  },
  modalContent: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'space-around'
  },
  actions: {},
  actionButton: {
    marginTop: 10,
    marginBottom: 10
  }
})
