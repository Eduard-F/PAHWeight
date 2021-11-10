import axios from 'axios'
import { BASE_API_URL } from '../config'

export const getOrganisations = async (token) => {
    try {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token.accessToken
        const details = await axios
            .get(BASE_API_URL + '/organisations')
            .then((json) => {
                if (json.data?.hasOwnProperty('Connections')) {
                    return json.data.Connections || []
                } else {
                    return []
                }
            })
            .catch((err) => {
                console.log(err)
                if (err.response.status === 404) {
                    return []
                }
                if (err.response.status === 401) {
                    return []
                }
                return []
            })
        return details
    } catch (err) {
        console.log(err)
        if (axios.isCancel(err)) console.log('Request canceled', err.message)
    }
}