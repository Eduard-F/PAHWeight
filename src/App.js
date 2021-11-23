import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { useColorScheme, LogBox } from 'react-native'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import HomeStackNavigator from './navigations/HomeStackNavigator'
import store, { persistor } from './redux/store'

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message

const App = (props) => {
    const isDarkMode = useColorScheme() === 'dark'
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
                    <HomeStackNavigator />
                </NavigationContainer>
            </PersistGate>
        </Provider>
    )
}

export default App
