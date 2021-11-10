import { SET_TOKEN } from '../../actions'
import { initialAuth } from '../../middleware/authService'

const reducer = (state = initialAuth, action) => {
    switch (action.type) {
        case SET_TOKEN:
            return action.content
        case 'CLEAR_TOKEN':
            return initialAuth
        default:
            return state
    }
}

export default reducer