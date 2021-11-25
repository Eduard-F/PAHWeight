import { handleAuthorize, handleRefresh, initialAuth } from '../redux/middleware/authService'
import axios from 'axios'
import { connect } from 'react-redux'

import { BASE_API_URL } from '../redux/config/index'
import { setToken } from '../redux/actions/index'
import { getDBConnection, getConfigItems, saveConfigItems, saveEmployeeItems, saveFieldItems, saveAssetItems, updateWeightItems, updateConfigItems, searchWeightItems } from '../services/db-service';



export async function SyncDatabase(db, token, organisation) {
    try {
        if (new Date(token.accessTokenExpirationDate).getTime() < Date.now()) {
            var success = await handleRefresh(token)
            token = success
        }
        var config = await getConfigItems(db);
        if (!config.length) {
            config = await saveConfigItems(db, [{
                'ConfigID': '1',
                'LastSync': 0,
                'Serial': 'testing',
                'CreatedDateUTC': 0,
                'UpdatedDateUTC': 0,
                'DeletedDateUTC': 0,
                'ServerDateUTC': 0,
            }])
        }
        const last_sync = config[0].LastSync
        var updated = last_sync
        
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token.accessToken
        axios.defaults.headers.common['pah-tenant-id'] = organisation.tenantId
        const employees = await axios
            .get(`${BASE_API_URL}/api/v1/employees?Everythingafter=${last_sync}`)
            .then((json) => {
                if (json.data?.hasOwnProperty('Employees'))
                    return json.data.Employees || []
                else
                    return []
            })
            .catch((err) => {
                console.log('err: '+ err)
                if (err.response.status === 404)
                    return []
                if (err.response.status === 401)
                    return []
                return []
            }
        )
        updated = await saveEmployeeItems(db, employees, updated)

        const assets = await axios
            .get(`${BASE_API_URL}/api/v1/assets?Everythingafter=${last_sync}`)
            .then((json) => {
                if (json.data?.hasOwnProperty('Assets'))
                    return json.data.Assets || []
                else
                    return []
            })
            .catch((err) => {
                console.log('err: '+ err)
                if (err.response.status === 404)
                    return []
                if (err.response.status === 401)
                    return []
                return []
            })
        updated = await saveAssetItems(db, assets, updated)

        const fields = await axios
        .get(`${BASE_API_URL}/api/v1/areas?AreaType=Field&Everythingafter=${last_sync}`)
        .then((json) => {
            if (json.data?.hasOwnProperty('Areas'))
                return json.data.Areas || []
            else
                return []
        })
        .catch((err) => {
            console.log('err: '+ err)
            if (err.response.status === 404)
                return []
            if (err.response.status === 401)
                return []
            return []
        })
        updated = await saveFieldItems(db, fields, updated)

        var weights = await searchWeightItems(db)
        if (weights.length) {
            await axios
            .post(`${BASE_API_URL}/api/v1/logs/weigh`, weights)
            .then((json) => {
                if (json.data?.hasOwnProperty('Weighs'))
                    for (var k in weights) {
                        weights[k].ServerDateUTC = new Date().getTime()
                    }
                    updateWeightItems(db, weights)
            })
            .catch((err) => {
                console.log('err: '+ err)
                if (err.response.status === 404)
                    return []
                if (err.response.status === 401)
                    return []
                return []
            })
        }
        
        if (config[0].LastSync != updated) {
            config[0].LastSync = updated
            await updateConfigItems(db, config)
        }
    } catch (error) {
        console.log(error)
    }
}