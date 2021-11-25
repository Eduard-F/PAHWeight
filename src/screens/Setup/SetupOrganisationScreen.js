import React, { useEffect } from 'react'
import { FlatList, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { connect } from 'react-redux'
import { fetchOrganisations, requestLogout, setOrganisation } from '../../redux/actions'

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

const SetupOrganisationScreen = (props) => {
    const isDarkMode = useColorScheme() === 'dark'

    const logout = () => {
        props.dispatch(requestLogout())
        props.navigation.navigate('SetupWelcome')
    }

    const selectOrganisation = (item) => {
        props.dispatch(setOrganisation(item))
        props.navigation.navigate('Home')
    }

    useEffect(() => {
        if (props.token?.refreshToken !== '') {
            props.dispatch(fetchOrganisations(props.token))
        }
    }, [props.token])

    return (
        <Background style={{ flex: 1 }}>
            <SafeAreaView>
                <View style={{
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                }}>
                    <View style={{
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
                                marginTop: 30,
                                marginBottom: 10,
                            },
                        ]}>Organisations</Text>
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
                        ]}>Select your Organisation</Text>
                        <FlatList
                            bottomDivider
                            data={props.organisations?.filter((item) => item.tenantParentId === '' ?? item)}
                            style={{
                                width: 320,
                                minWidth: 320
                            }}
                            renderItem={({ item }) => (
                                <ListItem bottomDivider key={item.tenantId} onPress={() =>
                                    selectOrganisation(item)
                                }>
                                    <ListItem.Content>
                                        <ListItem.Title>{item.name}</ListItem.Title>
                                        <ListItem.Subtitle>{item.permission}</ListItem.Subtitle>
                                    </ListItem.Content>
                                    <ListItem.Chevron />
                                </ListItem>
                            )}
                            keyExtractor={item => item.id}
                        />
                        <TouchableOpacity
                            style={[styles.button, {}]}
                            onPress={() => logout()}
                        >
                            <Text style={[styles.buttonText, { color: isDarkMode ? Colors.white : Colors.darker }]}>Switch User</Text>
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
        token: globalState.auth.token,
        organisations: globalState.auth.organisation.organisations,
    }
}

export default connect(mapStateToProps)(SetupOrganisationScreen)