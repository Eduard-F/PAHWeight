export const BASE_URL = 'https://planaheadgroup.com'
export const BASE_API_URL = 'https://api.planaheadgroup.com'
export const OAUTH_CLIENTS = {
    identityserver: {
        issuer: 'https://planaheadgroup.com',
        clientId: 'native.farmapp',
        redirectUrl: 'com.pahweighunit:/oauthredirect',
        usePKCE: true,
        // additionalParameters: {},
        scopes: ['openid', 'profile', 'email', 'pahapi', 'roles', 'offline_access'],
        warmAndPrefetchChrome: true
    }
}