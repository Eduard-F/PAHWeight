import type, {Node} from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import {Text, View, FlatList, StyleSheet, TouchableOpacity, Button} from 'react-native';

import { getDBConnection, getDeviceItems, saveDeviceItems, deleteDeviceItem, checkCreateTables, deleteTable } from '../services/db-service';

const SettingsScreen = ({ navigation }) => {
  const [device_arr, setDevice_arr] = useState([])


  const loadDataCallback = useCallback(async () => {
    try {
      const db = await getDBConnection();
      await checkCreateTables();
      const initValues = [{ serial: 'WeighUnit Demo', ip: '10.0.0.5', port: '22000', username: 'RPiHotspot1', password: '1234567890', lastUsed: 0 }];
      const res = await getDeviceItems(db);
      if (res.length) {
        setDevice_arr(res);
      } else {
        await saveDeviceItems(db, initValues);
        setDevice_arr(initValues);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);
  
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