import AsyncStorage from '@react-native-async-storage/async-storage'

export async function setStorage(key, value) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error(error)
        return false
    }

    return true
};

export async function getStorage(key) {
    try {
        const value = await AsyncStorage.getItem(key)
        return JSON.parse(value)
    } catch (error) {
        console.error(error)
        return null
    }
}