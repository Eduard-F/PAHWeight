import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import authReducer from './auth'
import mainReducer from './main'

const sensitiveStorage = createSensitiveStorage({
    keychainService: 'myKeychain',
    sharedPreferencesName: 'mySharedPrefs'
})

const mainPersistConfig = {
    key: 'root',
    storage: AsyncStorage,
    blacklist: ['auth']
}

const tokenPersistConfig = {
    key: 'auth',
    storage: sensitiveStorage
}

const rootReducer = combineReducers({
    auth: persistReducer(tokenPersistConfig, authReducer),
    main: mainReducer
})

export default persistReducer(mainPersistConfig, rootReducer)