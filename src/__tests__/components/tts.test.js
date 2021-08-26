import React from 'react'
import renderer from 'react-test-renderer'
import TitleText from '../../components/TitleText'
import Colors from '../../constants/Colors'
import WelcomeScreen from '../../screens/WelcomeScreen'
import Tts from '../../components/Tts'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { act } from 'react-dom/test-utils';

jest.mock('expo-speech', () => {
  return () => ({
    maxSpeechInputLength: jest.fn(),
    isSpeakingAsync: jest.fn(),
  })
})

test('Text alignment left', () => {
  const tree = renderer.create(<TitleText style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'left' }}
                                          text={'Hallo'}/>)
  expect(tree).toMatchSnapshot()
})

test('Text alignment right', () => {
  const tree = renderer.create(<TitleText style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'right' }}
                                          text={'Hallo'}/>)
  expect(tree).toMatchSnapshot()
})

test('Text alignment center', () => {
  const tree = renderer.create(<TitleText style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'center' }}
                                          text={'Hallo'}/>)
  expect(tree).toMatchSnapshot()
})

test('Text color secondary', () => {
  const tree = renderer.create(<TitleText style={{ color: Colors.secondary, paddingLeft: 5, textAlign: 'center' }}
                                          text={'Hallo'}/>)
  expect(tree).toMatchSnapshot()
})

it('should find the button via testId', () => {
  const {getByTestId} = render(<WelcomeScreen />);

  const foundButton = getByTestId('welcomeScreen1');
  expect(foundButton).toBeTruthy();
});

it('tts (asynch) test', async () => {
  const {getByTestId} = render(<WelcomeScreen />);

  const foundButton = getByTestId('welcomeScreen1');
  await fireEvent.press(foundButton);
  await waitFor(() => expect(global.ttsIsCurrentlyPlaying).toBeTruthy());
});
