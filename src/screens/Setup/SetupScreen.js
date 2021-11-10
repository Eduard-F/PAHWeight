import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import React from 'react'
import { connect } from 'react-redux'
import SetupOrganisationScreen from './SetupOrganisationScreen'
import SetupWelcomeScreen from './SetupWelcomeScreen'

const Tabs = createMaterialTopTabNavigator()

const SetupScreen = (props) => {
    return (
        <Tabs.Navigator initialRouteName={props.token?.refreshToken !== '' ? 'SetupOrganisation' : 'SetupWelcome'} tabBar={() => null}>
            <Tabs.Screen name='SetupWelcome' component={SetupWelcomeScreen} options={{ headerShown: false, swipeEnabled: false }} />
            <Tabs.Screen name='SetupOrganisation' component={SetupOrganisationScreen} options={{ headerShown: false, swipeEnabled: false }} />
        </Tabs.Navigator>
    )
}

const mapStateToProps = (globalState) => {
    return {
        token: globalState.auth.token
    }
}

export default connect(mapStateToProps)(SetupScreen)