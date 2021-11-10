import { combineReducers } from 'redux'
import account from './account'
import organisation from './organisation'
import subscription from './subscription'
import token from './token'

export default combineReducers({
    account,
    subscription,
    organisation,
    token,
})