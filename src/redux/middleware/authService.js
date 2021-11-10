import axios from 'axios'
import { Alert } from 'react-native'
import { authorize, refresh, revoke } from 'react-native-app-auth'
import { OAUTH_CLIENTS } from '../config'

export const initialAuth = {
    hasLoggedInOnce: false,
    provider: '',
    accessToken: '',
    accessTokenExpirationDate: '',
    refreshToken: ''
}

export const configureAxiosHeaders = (token) => {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}

export const handleAuthorize = async (provider) => {
    try {
        const config = OAUTH_CLIENTS[provider]
        const newAuthState = await authorize(config)
        console.log(newAuthState)
        configureAxiosHeaders(newAuthState.accessToken)
        return {
            hasLoggedInOnce: true,
            provider: provider,
            ...newAuthState
        }
    } catch (error) {
        Alert.alert('Failed to log in', error.message)
        return initialAuth
    }
}

export const handleRefresh = async (current) => {
    try {
        const config = OAUTH_CLIENTS[current.provider]
        const newAuthState = await refresh(config, {
            refreshToken: current.refreshToken
        })
        configureAxiosHeaders(newAuthState.accessToken)
        return {
            ...current,
            ...newAuthState,
            refreshToken: newAuthState.refreshToken || current.refreshToken
        }
    } catch (error) {
        console.log(error)
        Alert.alert('Failed to refresh token', error.message)
        return current
    }
}

export const handleRevoke = async (provider) => {
    try {
        const config = OAUTH_CLIENTS[provider]
        await revoke(config, {
            tokenToRevoke: auth.accessToken,
            sendClientId: true
        })
        return initialAuth
    } catch (error) {
        Alert.alert('Failed to revoke token', error.message)
        return initialAuth
    }
}