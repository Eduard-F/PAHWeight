import {Button, View, Text} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import SetupScreen from '../screens/Setup/SetupScreen'

import React from 'react'
import { connect } from 'react-redux'

const Stack = createNativeStackNavigator()

const HomeStackNavigator = (props) => {
    console.log(props.token)
    console.log(props.organisation?.OrganisationID)
    return (
        <Stack.Navigator initialRouteName={props.organisation?.OrganisationID !== '' && props.organisation ? 'Home' : 'Setup'} screenOptions={{ headerBackTitle: 'Dashboard' }}>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Welcome' }} />
            <Stack.Screen name='Setup' component={SetupScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

const HomeScreen = ({ navigation }) => {
    return (
        <View>
            <Text>Home</Text>
        </View>
    );
  };

const mapStateToProps = (globalState) => {
    return {
        organisation: globalState.auth.organisation.organisation,
        token: globalState.auth.token
    }
}

export default connect(mapStateToProps)(HomeStackNavigator)