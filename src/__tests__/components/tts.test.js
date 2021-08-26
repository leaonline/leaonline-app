import React from 'react';
import renderer from 'react-test-renderer';
import TitleText from '../../components/TitleText';
import Colors from '../../constants/Colors'
import WelcomeScreen from '../../screens/WelcomeScreen'
import { fireEvent, render, waitFor } from '@testing-library/react-native'


jest.mock('expo-speech', () => {
  return () => ({
    maxSpeechInputLength: jest.fn(),
  })
})

test('Text alignment left', () => {
  const tree = renderer.create(<TitleText style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'left' }} text={'Hallo'} />);
  expect(tree).toMatchSnapshot();
});

test('Text alignment right', () => {
  const tree = renderer.create(<TitleText style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'right' }} text={'Hallo'} />);
  expect(tree).toMatchSnapshot();
});

test('Text alignment center', () => {
  const tree = renderer.create(<TitleText style={{ color: Colors.primary, paddingLeft: 5, textAlign: 'center' }} text={'Hallo'} />);
  expect(tree).toMatchSnapshot();
});

test('Text color secondary', () => {
  const tree = renderer.create(<TitleText style={{ color: Colors.secondary, paddingLeft: 5, textAlign: 'center' }} text={'Hallo'} />);
  expect(tree).toMatchSnapshot();
});

test('testing if button clicked and voice speaking', async () => {
  const { getByTestId } = render(<WelcomeScreen/>)
  fireEvent.press(getByTestId("TextToSpeech.Button"));
  await waitFor(() => expect(global.ttsIsCurrentlyPlaying).toBeTruthy())
});