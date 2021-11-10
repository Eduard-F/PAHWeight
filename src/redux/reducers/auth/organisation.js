import { SET_ORGANISATION, SET_ORGANISATIONS } from '../../actions'

const initialState = {
    organisation: null,
    organisations: null,
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_ORGANISATION:
            return { ...state, organisation: action.content }
        case SET_ORGANISATIONS:
            return { ...state, organisations: action.content }
        case 'CLEAR_ORGANISATION':
            return initialState
        default:
            return state
    }
}

export default reducer