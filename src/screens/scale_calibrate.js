const net = require('net');

import type, {Node} from 'react';
import React, { useState, useEffect } from 'react';
import {Text, TextInput, View, Button, TouchableOpacity, TouchableWithoutFeedback, Modal} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import styles from "../styles";

var client = new net.Socket();

const ScaleCalibrateScreen = ({ route, navigation }) => {
  const { item } = route.params;

  const [msg, setMsg] = useState('');
  const [weight, setWeight] = useState('0');
  const [number, onChangeNumber] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);

  var options = {
      port: item.port,
      host: item.ip,
      reuseAddress: true,
  }
  useEffect(() => {
    navigation.addListener('blur', () => client.destroy())
    if (client._destroyed) {
      console.log('creating new connection')
      client = new net.Socket();
    }

    client.connect(options);

    client.on('connect', () => {
      console.log('Opened client on ' + JSON.stringify(client.address()))
    });

    client.on('data', (data) => {
      for (var msg of data.toString().split('*').slice(0, -1)) {
        var arr = msg.toString().split('_')
        if (arr[0] == 'cmd') {
          if (arr[1] == "calDone") {
            setMsg("Calibration done");
            setWeight("0")
          } else if (arr[1] == 'tareDone') {
            setMsg("Tare done");
          }
        } else if (arr[0] == 'weight')
          setWeight((parseFloat(arr[1])/1000).toFixed(2));
        }
    });

    client.on('error', (error) => {
      client.destroy();
      setMsg('Client error ' + error);
    });
  },[]);


  return (
    <View style={{flex: 1}}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <TouchableOpacity style={{flex:1}} onPress={() => {setModalVisible(!modalVisible)}}>
          <View style={{flex: 1,justifyContent: "center",alignItems: "center", backgroundColor: 'rgba(0,0,0,0.4)'}}>
            <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <View>
                <Text style={{fontWeight: 'bold', fontSize: 25, color: '#424242', marginBottom: 25}}>Calibrate</Text>
              </View>
              <View style={{alignItems: 'flex-start', marginBottom: 20}}>
                <Text style={{color: '#424242'}}>Calibration weight (kg):</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={onChangeNumber}
                  value={number}
                  placeholder="Weight in kg"
                  keyboardType="numeric"
                  selectTextOnFocus={true}
                  // autoFocus={true}
                />
              </View>
              <Button title="Calibrate now" onPress={() => {setModalVisible(false);client.write('calibrate_'+ number*1000 + '*')}}/>
            </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={{flex: 1}}>
          <View style={{flex: 1}}>
            <View style={{flex: 1, justifyContent: 'space-around', alignItems: 'center'}}>
                <Text style={{fontSize: 60, fontWeight: 'bold', color: '#616161'}}>{weight}</Text>
                <Text style={{fontSize: 20, fontWeight: 'bold', color: '#616161'}}>{msg}</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20}}>
            <LinearGradient
              colors={['#00FFFF', '#17C8FF', '#329BFF', '#4C64FF', '#6536FF', '#8000FF']}
              start={{x: 0.0, y: 1.0}} end={{x: 1.0, y: 1.0}}
              style={styles.outline_btn_gradiant}
              >
              <TouchableOpacity style={styles.outline_btn_touchable} onPress={Tare}>
              <Text adjustsFontSizeToFit style={styles.outline_btn_txt}>
                  Tare
              </Text>
              </TouchableOpacity>
            </LinearGradient>

            <LinearGradient
              colors={['#00FFFF', '#17C8FF', '#329BFF', '#4C64FF', '#6536FF', '#8000FF']}
              start={{x: 0.0, y: 1.0}} end={{x: 1.0, y: 1.0}}
              style={styles.outline_btn_gradiant}
              >
              <TouchableOpacity style={styles.outline_btn_touchable} onPress={() => setModalVisible(!modalVisible)}>
              <Text adjustsFontSizeToFit style={styles.outline_btn_txt}>
                  Calibrate
              </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
      </View>
    </View>
  );
};

function Tare() {
  client.write('tare*');
}

module.exports = { ScaleCalibrateScreen };