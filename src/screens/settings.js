import type, {Node} from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import {Text, View, FlatList, StyleSheet, TouchableOpacity, Button} from 'react-native';

import { getDBConnection, getDeviceItems, saveDeviceItems, checkCreateTables, deleteTable } from '../services/db-service';

const SettingsScreen = ({ route, navigation }) => {
  const [device, setDevice] = useState({})
  
  const renderItem = ({ item }) => (
    <View>
      <TouchableOpacity style={styles.button} onPress={() => {
        navigation.navigate('WirelessScale', {
          ip: item.ip,
          port: parseInt(item.port),
        });}
      }><Text style={styles.button_txt}>Serial: {item.serial} || IP: {item.ip} ||  PORT: {item.port}</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <Text>Settings</Text>
      <FlatList
        data={device_arr}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};


var styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgb(96, 125, 139)',
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {width: 0,height: 2,},
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 10,
    padding: 10
  },
  button_txt: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 20,
  },
});

module.exports = { SettingsScreen };