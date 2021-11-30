import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { connect } from 'react-redux'

import SetupScreen from '../screens/Setup/SetupScreen'
import { WeightScreen } from '../screens/weight';
import { DropdownListScreen } from '../screens/dropdown_list';
import { SettingsScreen } from '../screens/settings';
import { WirelessScreen } from '../screens/wireless_scale';
import { ScanDeviceScreen } from '../screens/add_device';
import { QRCodeScreen } from '../screens/qr_code';
import HomeScreen from '../screens/home';

const Stack = createNativeStackNavigator()

const HomeStackNavigator = (props) => {
    return (
        <Stack.Navigator initialRouteName={props.organisation?.OrganisationID !== '' && props.organisation ? 'Home' : 'Setup'} screenOptions={{ headerBackTitle: 'Dashboard' }}>
            <Stack.Screen name='Home' component={HomeScreen} options={{ title: 'Welcome' }} />
            <Stack.Screen name='Setup' component={SetupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DropdownList" component={DropdownListScreen} />
            <Stack.Screen name="Weight" component={WeightScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="WirelessScale" component={WirelessScreen} />
            <Stack.Screen name="AddDevice" component={ScanDeviceScreen} />
            <Stack.Screen name="QRCode" component={QRCodeScreen} />
        </Stack.Navigator>
    )
}


const mapStateToProps = (globalState) => {
    return {
        organisation: globalState.auth.organisation.organisation,
        token: globalState.auth.token
    }
}

export default connect(mapStateToProps)(HomeStackNavigator)