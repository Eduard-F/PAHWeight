import { SET_SUBSCRIPTION } from '../../actions'

const initialState = null

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SUBSCRIPTION:
            return action.content
        case 'CLEAR_SUBSCRIPTION':
            return initialState
        default:
            return state
    }
}

export default reducer