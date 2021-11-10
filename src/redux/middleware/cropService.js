import axios from 'axios'
import { SET_BLOCKS, SET_FIELDS, SET_GROUPS, SET_ZONES } from '../actions'
import { BASE_API_URL } from '../config'

export const getAreas = async (data, token, organisation, type) => {
    try {
        var filter
        if (type === SET_FIELDS)
            filter = 'Field'
        else if (type === SET_GROUPS)
            filter = 'Group'
        else if (type === SET_BLOCKS)
            filter = 'Block'
        else if (type === SET_ZONES)
            filter = 'Zone'

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token.accessToken
        axios.defaults.headers.common['pah-tenant-id'] = organisation.tenantId
        const details = await axios
            .get(`${BASE_API_URL}/api/v1/areas?Status=Active${filter ? ('&AreaType=' + filter) : ''}`)
            .then((json) => {
                if (json.data?.hasOwnProperty('Areas'))
                    return json.data.Areas || data || []
                else
                    return data || []
            })
            .catch((err) => {
                if (err.response.status === 404)
                    return data || []
                if (err.response.status === 401)
                    return data || []
                return data || []
            })
        return details
    } catch (err) {
        if (axios.isCancel(err)) console.log('Request canceled', err.message)
        return data || []
    }
}