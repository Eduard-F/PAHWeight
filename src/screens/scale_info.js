const net = require('net');

import type, {Node} from 'react';
import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';
import LinearGradient from 'react-native-linear-gradient';

import { getDBConnection, deleteDeviceItem } from "../services/db-service";

import styles from "../styles";

const ScaleInfoScreen = ({ route, navigation }) => {
  const { item } = route.params;

  function deleteDevice() {
    const promise1 = getDBConnection()
    promise1.then( res => {
      deleteDeviceItem(res, item.serial)
      navigation.navigate('Home')
    })
  }

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1, alignItems: 'center'}}>
        <View style={[styles.card, {flexDirection: 'row', justifyContent: 'center', marginTop: 20}]}>
          <View style={{marginVertical: 20, marginLeft: 20}}>
            <Text style={{fontWeight: 'bold', color: '#424242', padding: 2}}>Serial: </Text>
            <Text style={{fontWeight: 'bold', color: '#424242', padding: 2}}>Wifi Name: </Text>
            <Text style={{fontWeight: 'bold', color: '#424242', padding: 2}}>Password: </Text>
            <Text style={{fontWeight: 'bold', color: '#424242', padding: 2}}>Ip: </Text>
            <Text style={{fontWeight: 'bold', color: '#424242', padding: 2}}>Port: </Text>
            <Text style={{fontWeight: 'bold', color: '#424242', padding: 2}}>Last Used: </Text>
          </View>
          <View style={{marginVertical: 20, marginRight: 20}}>
            <Text style={{fontWeight: 'bold', color: '#757575', padding: 2}}>{item.serial}</Text>
            <Text style={{fontWeight: 'bold', color: '#757575', padding: 2}}>{item.username}</Text>
            <Text style={{fontWeight: 'bold', color: '#757575', padding: 2}}>{item.password}</Text>
            <Text style={{fontWeight: 'bold', color: '#757575', padding: 2}}>{item.ip}</Text>
            <Text style={{fontWeight: 'bold', color: '#757575', padding: 2}}>{item.port}</Text>
            <Text style={{fontWeight: 'bold', color: '#757575', padding: 2}}>{item.lastUsed}</Text>
          </View>
        </View>
      </View>
      
      <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20}}>
        <LinearGradient
          colors={['#ee4a3d', '#f1391c', '#e22d1e', '#d12119', '#c41711', '#b60000']}
          start={{x: 0.0, y: 1.0}} end={{x: 1.0, y: 1.0}}
          style={styles.outline_btn_gradiant}
        >
          <TouchableOpacity style={styles.outline_btn_touchable} onPress={() => deleteDevice()}>
            <Text adjustsFontSizeToFit style={[styles.outline_btn_txt, {color: '#d12119'}]}>
              Delete <Icon style={styles.icon} name="trash"/>
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={['#00FFFF', '#17C8FF', '#329BFF', '#4C64FF', '#6536FF', '#8000FF']}
          start={{x: 0.0, y: 1.0}} end={{x: 1.0, y: 1.0}}
          style={styles.outline_btn_gradiant}
          >
          <TouchableOpacity style={styles.outline_btn_touchable} onPress={() => {navigation.navigate('ScaleCalibrate', {'item': item})}}>
          <Text adjustsFontSizeToFit style={styles.outline_btn_txt}>
              Calibration
          </Text>
          </TouchableOpacity>
        </LinearGradient>

      </View>
    </View>
  );
};



module.exports = { ScaleInfoScreen };