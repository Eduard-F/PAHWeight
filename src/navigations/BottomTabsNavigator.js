import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { ActionSheetIOS, useColorScheme, View } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { AddIcon, DashboardIcon, SettingsIcon, StatsIcon } from '../assets/Icons'
import ActivityScreen from '../modules/activities/ActivityScreen'
import ReminderScreen from '../modules/reminders/ReminderScreen'
import ReportScreen from '../modules/reports/ReportScreen'
import SettingScreen from '../modules/settings/SettingScreen'
import OverviewTabsNavigator from './OverviewTabsNavigator'

const BottomTab = createBottomTabNavigator()

const BottomTabsNavigator = () => {
    const isDarkMode = useColorScheme() === 'dark'
    return <BottomTab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                // let iconName
                if (route.name === 'Dashboard')
                    return <DashboardIcon style={{ height: size, width: size, color: color, fill: color }} />
                else if (route.name === 'Reports')
                    return <StatsIcon style={{ height: size, width: size, color: color, fill: color }} />
                else if (route.name === 'Activity')
                    return <View style={{
                        position: 'absolute',
                        bottom: 5, // space from bottombar
                        height: 48,
                        width: 48,
                        backgroundColor: isDarkMode ? 'black' : 'white',
                        borderColor: color,
                        borderStyle: 'solid',
                        borderWidth: 2,
                        borderRadius: 48 / 2,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}><AddIcon style={{ height: size, width: size, color: color, fill: color }} /></View>
                else if (route.name === 'Reminders')
                    return <Ionicons name={'time'} size={size} color={color} />
                else if (route.name === 'Settings')
                    return <SettingsIcon style={{ height: size, width: size, color: color, fill: color }} />
            },
            tabBarActiveTintColor: '#7cc84b',
            tabBarInactiveTintColor: 'gray',
            // headerShown: false,
            tabBarShowLabel: false,
        })}
    >
        <BottomTab.Screen name='Dashboard' component={OverviewTabsNavigator} options={{ headerShown: false }} />
        <BottomTab.Screen name='Reports' component={ReportScreen} />
        <BottomTab.Screen name='Activity'
            component={ActivityScreen}
            options={{ tabBarShowLabel: false }}
            listeners={({ navigation }) => ({
                tabPress: (e) => {
                    // Prevent default action
                    e.preventDefault()
                    ActionSheetIOS.showActionSheetWithOptions(
                        {
                            options: ['Cancel', 'Refueling', 'Weighing', 'Scouting', 'Planting', 'Spraying', 'Havesting', 'Attendence', 'Clock In/Out', 'Gate Access', 'Activity', 'Reminders'],
                            destructiveButtonIndex: 12,
                            cancelButtonIndex: 0,
                            userInterfaceStyle: isDarkMode ? 'dark' : 'light'
                        },
                        buttonIndex => {
                            if (buttonIndex === 0) {
                                // cancel action
                            } else if (buttonIndex === 1) {
                                navigation.navigate('Refueling')
                            } else if (buttonIndex === 2) {
                                navigation.navigate('Weighing')
                            } else if (buttonIndex === 3) {
                                navigation.navigate('Scouting')
                            }
                        }
                    )
                },
            })} />
        <BottomTab.Screen name='Reminders' component={ReminderScreen} />
        <BottomTab.Screen name='Settings' component={SettingScreen} />
    </BottomTab.Navigator>
}

export default BottomTabsNavigator