import { handleAuthorize, handleRefresh, initialAuth } from '../middleware/authService'
import { getAreas } from '../middleware/cropService'
import { getOrganisations } from '../middleware/orgService'

// Auth action types
export const SET_TOKEN = 'SET_TOKEN'

export const requestLogin = (provider = 'identityserver') => {
    return async dispatch => {
        function onSuccess(success) {
            console.log('login success')
            dispatch(setToken(success))
            return success
        }
        function onError(error) {
            console.log('login error')
            dispatch(setToken(initialAuth))
            return initialAuth
        }
        try {
            const success = await handleAuthorize(provider)
            console.log('handleAuthorize done')
            return onSuccess(success)
        } catch (error) {
            console.log('handleAuthorize error')
            return onError(error)
        }
    }
}

export const requestRefresh = (token) => {
    return async dispatch => {
        function onSuccess(success) {
            dispatch(setToken(success))
            return success
        }
        function onError(error) {
            dispatch(setToken(token))
            return token
        }
        try {
            const success = await handleRefresh(token)
            return onSuccess(success)
        } catch (error) {
            return onError(error)
        }
    }
}

export const requestLogout = (provider = 'identityserver') => {
    return async dispatch => {
        function onSuccess(success) {
            dispatch(clearAreas())
            dispatch(clearOrganisation())
            dispatch(clearToken(success))
            return success
        }
        function onError(error) {
            dispatch(clearAreas())
            dispatch(clearOrganisation())
            dispatch(clearToken())
            return error
        }
        try {
            const success = await handleRevoke(provider)
            return onSuccess(success)
        } catch (error) {
            return onError(error)
        }
    }
}

export const setToken = (data) => {
    return {
        type: SET_TOKEN,
        content: data
    }
}

export const clearToken = () => {
    return {
        type: 'CLEAR_TOKEN'
    }
}

// Accounts
export const SET_ACCOUNT = 'SET_ACCOUNT'
export const SET_ORGANISATIONS = 'SET_ORGANISATIONS'
export const SET_ORGANISATION = 'SET_ORGANISATION'
export const SET_SUBSCRIPTION = 'SET_SUBSCRIPTION'

export const fetchOrganisations = (token) => {
    return async dispatch => {
        function onToken(success) {
            dispatch(setToken(success))
            return success
        }
        function onSuccess(success) {
            dispatch(setOrganisations(success))
            // dispatch(setOrganisations([{ OrganisationID: '70517eed-406f-4ef8-88ca-0f6afc1474d4' }]))
            // dispatch(setOrganisation({ OrganisationID: '70517eed-406f-4ef8-88ca-0f6afc1474d4' }))
            return success
        }
        function onError(error) {
            dispatch(setOrganisations([]))
            // dispatch(setOrganisations([{ OrganisationID: '70517eed-406f-4ef8-88ca-0f6afc1474d4' }]))
            // dispatch(setOrganisation({ OrganisationID: '70517eed-406f-4ef8-88ca-0f6afc1474d4' }))
            return error
        }
        try {
            if (new Date(token.accessTokenExpirationDate).getTime() < Date.now())
                token = onToken(await handleRefresh(token))
            var success = await getOrganisations(token)
            return onSuccess(success)
        } catch (error) {
            return onError(error)
        }
    }
}

export const setOrganisations = (content) => {
    return {
        type: SET_ORGANISATIONS,
        content: content
    }
}

export const setOrganisation = (content) => {
    return {
        type: SET_ORGANISATION,
        content: content
    }
}

export const clearOrganisation = () => {
    return {
        type: 'CLEAR_ORGANISATION'
    }
}

// API actions types
export const SET_FIELDS = 'SET_FIELDS'
export const SET_GROUPS = 'SET_GROUPS'
export const SET_BLOCKS = 'SET_BLOCKS'
export const SET_ZONES = 'SET_ZONES'

export const fetchAreas = (data, token, organisation, type) => {
    return async dispatch => {
        function onToken(success) {
            dispatch(setToken(success))
            return success
        }
        function onSuccess(success) {
            switch (type) {
                case SET_FIELDS:
                    {
                        dispatch(setFields(success))
                        return success
                    }
                case SET_GROUPS:
                    {
                        dispatch(setGroups(success))
                        return success
                    }
                case SET_BLOCKS:
                    {
                        dispatch(setBlocks(success))
                        return success
                    }
                case SET_ZONES:
                    {
                        dispatch(setZones(success))
                        return success
                    }
                default:
                    return success
            }
        }
        function onError(error) {
            console.log(error)
            return data
        }
        try {
            var success = data
            if (new Date(token.accessTokenExpirationDate).getTime() < Date.now())
                token = onToken(await handleRefresh(token))
            switch (type) {
                case SET_FIELDS:
                    {
                        success = await getAreas(data, token, organisation, type)
                        return onSuccess(success)
                    }
                case SET_GROUPS:
                    {
                        success = await getAreas(data, token, organisation, type)
                        return onSuccess(success)
                    }
                case SET_BLOCKS:
                    {
                        success = await getAreas(data, token, organisation, type)
                        return onSuccess(success)
                    }
                case SET_ZONES:
                    {
                        success = await getAreas(data, token, organisation, type)
                        return onSuccess(success)
                    }
                default:
                    return onSuccess(data)
            }
        } catch (error) {
            return onError(error)
        }
    }
}
export const setFields = (data) => {
    return {
        type: SET_FIELDS,
        content: data
    }
}
export const setGroups = (data) => {
    return {
        type: SET_GROUPS,
        content: data
    }
}
export const setBlocks = (data) => {
    return {
        type: SET_BLOCKS,
        content: data
    }
}
export const setZones = (data) => {
    return {
        type: SET_ZONES,
        content: data
    }
}

// CLEAR ALL
export const clearAreas = () => {
    return {
        type: 'CLEAR_AREAS'
    }
}

export const requestClearData = () => {
    return async dispatch => {
        function onSuccess() {
            dispatch(clearAreas())
            return true
        }
        function onError(error) {
            dispatch(clearAreas())
            return error
        }
        try {
            return onSuccess()
        } catch (error) {
            return onError(false)
        }
    }
}