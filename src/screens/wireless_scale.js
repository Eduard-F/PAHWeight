const net = require('net');

import type, {Node} from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import {Text, View, FlatList, StyleSheet, TouchableOpacity, Button} from 'react-native';

var client = new net.Socket();

const WirelessScreen = ({ route, navigation }) => {
  const { ip, port } = route.params;

  const [msg, setMsg] = useState('');
  const [weight, setWeight] = useState('0');

  var options = {
      port: port,
      host: ip,
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
      var arr = data.toString().split('_')
      if (arr[0] == 'cmd') {
        if (arr[1] == "removeWeight") {
          setColor('rgb(170, 0, 0)')
          setWeight((parseFloat(arr[2])/1000).toFixed(2));
          weight_arr.push({id: weight_arr.length.toString(), title: (parseFloat(arr[2])/1000).toFixed(2)})
        } else if (arr[1] == 'addWeight') {
          setColor('rgb(0, 170, 0)')
        }
        setMsg(arr[1]);
      } else if (arr[0] == 'weight')
        setWeight((parseFloat(arr[1])/1000).toFixed(2));
    });

    client.on('error', (error) => {
      client.destroy();
      setMsg('Client error ' + error);
    });
  },[]);


  return (
    <View style={{flex: 1}}>
      <Text>WirelessScreen</Text>
      
      <Button title="Tare" onPress={Tare}/>
      <Button title="Callibrate" onPress={Callibrate}/>
      <Text>{msg}</Text>
      <Text>{weight}</Text>
    </View>
  );
};


function Callibrate(cal_weight='1000') {
  console.log('calibrate_'+cal_weight.toString())
  client.write('calibrate_'+'1000');
}

function Tare() {
  client.write('tare');
}

module.exports = { WirelessScreen };