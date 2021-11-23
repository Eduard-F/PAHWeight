import AsyncStorage from '@react-native-async-storage/async-storage'
// import data from '../../data/fields'
import { getStorage } from '../../../helpers/StorageHelper'
import { SET_BLOCKS, SET_FIELDS, SET_GROUPS, SET_ZONES } from '../../actions'

const initialState = {
    fields: null,
    groups: null,
    blocks: null,
    zones: null
}

const reducer = (state = initialState, action) => {
    AsyncStorage.getAllKeys((err, keys) => {
        keys.forEach(async key => {
            var root = await getStorage(key)
        })
    })
    switch (action.type) {
        case SET_FIELDS:
            return { ...state, fields: action.content }
        case SET_GROUPS:
            return { ...state, groups: action.content }
        case SET_BLOCKS:
            return { ...state, blocks: action.content }
        case SET_ZONES:
            return { ...state, zones: action.content }
        case 'CLEAR_AREAS':
            return initialState
        default:
            return state
    }
}

export default reducer