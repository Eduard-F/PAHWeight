import React from 'react'
import { Button, Text, View } from 'react-native'

export default function WalkthroughScreen({ navigation }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Startup screen</Text>
            <Button
                title="Go to Dashboard"
                onPress={() => navigation.navigate('Dashboard')}
            />
        </View>
    )
}