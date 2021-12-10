import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    button: {
        backgroundColor: 'rgb(138, 201, 38)',
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {width: 0,height: 2,},
        shadowOpacity: 0.4,
        shadowRadius: 3.84,
        elevation: 5,
        margin: 10,
        padding: 10
    },
    shadow: {
        shadowColor: 'rgba(0,0,0, .2)', //IOS
        shadowOffset: {width: 2,height: 2,}, //IOS
        shadowOpacity: 0.4, //IOS
        shadowRadius: 3.84, //IOS
        elevation: 2, //ANDROID
    },
    circle_button: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        shadowColor: 'rgba(0,0,0, .4)', //IOS
        shadowOffset: {width: 0,height: 2,}, //IOS
        shadowOpacity: 0.4, //IOS
        shadowRadius: 3.84, //IOS
        elevation: 5, //ANDROID
    },
    outline_btn_gradiant: {
        height: 50,
        width: 200,
        justifyContent: 'center',
        width: 200,
        margin: 5
    },
    outline_btn_touchable: {
        width: 200,
        alignItems: 'center'
    },
    outline_btn_txt: {
        paddingVertical: 0,
        marginLeft: 5,
        marginRight: 5,
        width: 190,
        height: 40,
        fontSize: 25,
        textAlign: 'center',
        color: '#4C64FF',
        backgroundColor: 'rgb(242, 242, 242)'
    },
    icon: {
        textAlign: 'center',
        fontSize: 30,
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    card: {
        borderRadius: 5,
        elevation: 2,
        backgroundColor: 'white',
        shadowOffset: {width: 1, height: 1},
        shadowColor: '#333',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        marginHorizontal: 20,
        marginVertical: 10
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    input: {
        width: 150,
        height: 40,
        borderBottomWidth: 2,
        padding: 10,
    },
});