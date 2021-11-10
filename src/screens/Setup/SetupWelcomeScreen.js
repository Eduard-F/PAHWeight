import React, { useEffect } from 'react'
import { ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { connect } from 'react-redux'
import { requestLogin } from '../../redux/actions'

const Background = ({ children, ...rest }) => {
    return (
        <ImageBackground
            accessibilityRole="image"
            source={{ uri: 'https://planaheadgroup.com/templates/images/email-wallpaper.jpg' }}
            style={[
                styles.background,
                {
                    backgroundColor: Colors.darker
                },
            ]}
            imageStyle={styles.logo}
            {...rest}>
            {children}
        </ImageBackground>
    )
}

const SetupWelcomeScreen = (props) => {
    const isDarkMode = useColorScheme() === 'dark'

    useEffect(() => {
        if (props.token?.refreshToken !== '')
            props.navigation.navigate('SetupOrganisation')
    }, [props.token])

    return (
        <Background style={{ flex: 1 }}>
            <SafeAreaView>
                <View style={{
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <View style={{
                        height: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={[
                            styles.text,
                            {
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isDarkMode ? Colors.white : Colors.darker,
                                textAlign: 'center',
                                marginBottom: 10,
                            },
                        ]}>Plan-A-Head</Text>
                        <Text style={[
                            styles.text,
                            {
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isDarkMode ? Colors.white : Colors.darker,
                                fontSize: 18,
                                textAlign: 'center',
                                marginBottom: 10
                            },
                        ]}>Let's get started</Text>
                    </View>
                    <View style={{
                        height: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 50
                    }}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: 'rgba(31,34,39,0.8)' }]}
                        >
                            <Text style={styles.buttonText}>Sign up with email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => props.dispatch(requestLogin())}
                            style={[styles.button, {}]}
                        >
                            <Text style={[styles.buttonText, { color: isDarkMode ? Colors.white : Colors.darker }]}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Background>
    )
}

const styles = StyleSheet.create({
    button: {
        height: 50,
        minHeight: 50,
        width: 300,
        minWidth: 300,
        padding: 15,
        marginTop: 5,
        marginHorizontal: 20,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        aspectRatio: 1
    },
    buttonText: {
        color: Colors.white,
        fontWeight: 'bold'
    },
    background: {
        paddingBottom: 20,
        paddingTop: 20,
        paddingHorizontal: 15,
    },
    logo: {
        opacity: 0.2,
        overflow: 'visible',
        resizeMode: 'cover',
        marginLeft: -128,
        marginBottom: -192,
        backgroundColor: 'rgba(31,34,39,0.8)'
    },
    text: {
        fontSize: 40,
        fontWeight: '700',
        textAlign: 'center',
    }
})

const mapStateToProps = (globalState) => {
    return {
        token: globalState.auth.token
    }
}

export default connect(mapStateToProps)(SetupWelcomeScreen)