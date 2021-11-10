import { SET_ACCOUNT } from '../../actions'

const initialState = null

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_ACCOUNT:
            return action.content
        case 'CLEAR_ACCOUNT':
            return initialState
        default:
            return state
    }
}

export default reducer