import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'

export const useAppState = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      console.debug('APP STATE', { nextAppState })
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("App has come to the foreground!");
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current)
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { state: appState.current, appStateVisible }
}