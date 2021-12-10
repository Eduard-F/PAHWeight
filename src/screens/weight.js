const net = require('net');

import type, {Node} from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import {Text, View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Button, DrawerLayoutAndroid} from 'react-native';
import { vw, vh } from 'react-native-expo-viewport-units';
import NFC from "react-native-rfid-nfc-scanner";
import WifiManager from "react-native-wifi-reborn";
import uuid from 'react-native-uuid';

import { SyncDatabase } from '../services/api'
import { getDBConnection, searchEmployeeItems, saveWeightItems, getConfigItems } from '../services/db-service';

var client = new net.Socket();
client._destroyed = true;
var options = {
    port: 22000,
    host: '10.0.0.5',
    reuseAddress: true,
    username: 'RPiHotspot1',
    password: '1234567890'
}
var config
var weight_temp = []


const Item = ({ title }) => (
  <View style={styles.item}>
    <Text style={styles.text}>{title} kg</Text>
  </View>
);

const WeightScreen = ({ route, navigation }) => {
  const [msg, setMsg] = useState('');
  const [loading_msg, setLoadingMsg] = useState('');
  const [weight, setWeight] = useState('0');
  const [color, setColor] = useState('rgb(40, 44, 52)')
  const [serial, setSerial] = useState('');
  const [weight_arr, setWeight_arr] = useState([])
  const [employee, setEmployee] = useState(['',''])
  const [field, setField] = useState(['',''])
  const [asset, setAsset] = useState(['',''])
  const [loading, setLoading] = useState(true)


  const asyncCallback = useCallback(async () => {
    const db = await getDBConnection();
    config = await getConfigItems(db);
    setSerial(config[0].Serial)
  });

  async function rfid_callback(payload) {
    console.log("id: " + payload.id)
    const db = await getDBConnection();
    results = await searchEmployeeItems(db, payload.id);
    if (results.length) {
      if (results[0].Supervisor) {
        console.log('supervisor: ' + results[0].id)
        EndWeight(results[0].id);
      } else if (!results[0].Supervisor & weight_temp.length == 0){
        setEmployee([results[0].id, results[0].value])
        setColor('rgb(170, 0, 0)');
        console.log('normal')
        StartWeight();
      }
    }
    NFC.initialize();
  }

  useEffect(() => {
    if (route.params?.child_model) {
      if (route.params?.child_model == 'employee') {
        setEmployee([route.params?.child_id, route.params?.child_value])
        setColor('rgb(170, 0, 0)');
        StartWeight();
      } else if (route.params?.child_model == 'field') {
        setField([route.params?.child_id, route.params?.child_value])
      } else if (route.params?.child_model == 'asset') {
        setAsset([route.params?.child_id, route.params?.child_value])
      }
    }
  }, [route.params?.child_value]);

  useEffect(() => {
    asyncCallback()
    NFC.initialize();
    NFC.removeAllListeners();
    NFC.addListener('weight', rfid_callback, rfid_error);
    navigation.addListener('blur', () => {NFC.removeListener('weight');})
    navigation.addListener('focus', () => {NFC.addListener('weight', rfid_callback, rfid_error);})
    navigation.addListener('beforeRemove', (e) => {
      // prevent some errors if client was never created
      if (client._destroyed == false) {
        client.destroy();
      }
      NFC.removeAllListeners();
    })
    setColor('rgb(40, 44, 52)') // default grey colour
    
    if (client._destroyed) {
      console.log('creating new connection')
      client = new net.Socket();
    }

    client.on('connect', () => {
      setLoading(false);
      console.log('Opened client on ' + JSON.stringify(client.address()))
    });

    client.on('data', (data) => {
      for (var msg of data.toString().split('*').slice(0, -1)) {
        var arr = msg.toString().split('_')
        if (arr[0] == 'cmd') {
          if (arr[1] == "removeWeight") {
            setColor('rgb(0, 170, 0)')
            setMsg('Remove Weight');
            setWeight(arr[2]);
            weight_temp.push({
              id: weight_temp.length.toString(),
              title: arr[2],
              date: new Date().getTime()
            })
            setWeight_arr(weight_temp)
          } else if (arr[1] == 'addWeight') {
            setColor('rgb(170, 0, 0)')
            setMsg('Add Weight');
          } else {
            setMsg(arr[1]);
          }
        } else if (arr[0] == 'weight')
          setWeight(arr[1]);
      }
      
    });

    client.on('error', (error) => {
      client.destroy();
      navigation.goBack()
    });

    WifiManager.getCurrentWifiSSID().then(
      ssid => {
        console.log("Your current connected wifi SSID is " + ssid);
        if (ssid != options.username) {
          setLoadingMsg('Connecting to "' + options.username + '" wifi SSID')
          handleWifiPermission()
        } else {
          client.connect(options);
        }
      },
      () => {
        console.log("Cannot get current SSID!");
        handleWifiPermission()
      }
    );
  },[]);


  const renderItem = ({ item }) => (
    <Item title={(parseFloat(item.title)/1000).toFixed(2)} />
  );

  const handleWifiPermission = async () => {
    var granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Weigh Unit wifi Permission",
        message:
          "Weigh Unit needs access to your wifi " +
          "so it can connect you to the wireless scale.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      WifiManager.connectToProtectedSSID(options.username, options.password, false).then(
        () => {
          console.log("Connected successfully!");
          setLoadingMsg('Connected to "' + options.username + '" wifi. Linking to scale...')
          setTimeout(function(){client.connect(options);}, 2000)
        },
        (error) => {
          console.log(error);
          console.log("Connection failed!");
          setLoadingMsg('Connection failed! Make sure wifi is enabled and scale is turned on.')
          setTimeout(function(){navigation.goBack();}, 3000)
        }
      );
    } else {
      console.log("wifi permission denied");
      setLoadingMsg('wifi permission denied')
    }
  };

  
  function EndWeight(supervisor=null) {
    console.log('endWeight')
    if (field[0] || weight_arr.length == 0) {
      weight_temp = []
      for (var k of weight_arr) {
        weight_temp.push({
          TransactionID: uuid.v4(),
          Weight: k.title,
          EmployeeID: employee[0],
          SupervisorID: supervisor ? supervisor : employee[0],
          FieldID: field[0],
          VarietyID: '',
          AssetID: asset[0],
          SerialNumber: serial,
          CreatedDateUTC: k.date,
          UpdatedDateUTC: 0,
          DeletedDateUTC: 0,
          ServerDateUTC: 0,
        })
      }
      saveWeightItems(weight_temp)
      weight_temp = []
      setWeight_arr([])
      setEmployee(['',''])
      setField(['',''])
      setAsset(['',''])
      setColor('rgb(40, 44, 52)');
      setWeight('0')
      setMsg('')
      client.write('endWeight*');
      const promise1 = getDBConnection()
      promise1.then( res => {
          SyncDatabase(res, config[0].token, config[0].organisation)
      })
      
    } else {
      navigation.navigate('DropdownList', {
        model: 'field',
        rfid: false,
        location: true,
      });
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>{loading_msg}</Text>
      </View>
    );
  } else {
    return (
      <View style={{flex: 1, backgroundColor: color}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex:1, marginHorizontal: 20, marginVertical: 10}}>
            <Text numberOfLines={1} style={[styles.text]}>Employee</Text>
            <TouchableOpacity style={styles.button} onPress={() => {
              navigation.navigate('DropdownList', {
                model: 'employee',
                rfid: true,
                location: false,
              });
            }}><Text adjustsFontSizeToFit style={styles.button_txt}>{employee[1]}</Text></TouchableOpacity>
          </View>
          <View style={{flex:1, marginHorizontal: 20, marginVertical: 10}}>
            <Text style={[styles.text]}>Field</Text>
            <TouchableOpacity style={styles.button} onPress={() => {
              navigation.navigate('DropdownList', {
                model: 'field',
                rfid: false,
                location: true,
              });
            }}><Text adjustsFontSizeToFit numberOfLines={1} style={styles.button_txt}>{field[1]}</Text></TouchableOpacity>
          </View>
          <View style={{flex:1, marginHorizontal: 20, marginVertical: 10}}>
            <Text style={[styles.text]}>Asset</Text>
            <TouchableOpacity style={styles.button} onPress={() => {
              navigation.navigate('DropdownList', {
                model: 'asset',
                rfid: true,
                location: false,
              });
            }}><Text adjustsFontSizeToFit numberOfLines={1} style={styles.button_txt}>{asset[1]}</Text></TouchableOpacity>
          </View>
        </View>
        <View style={{flex:1, flexDirection:'row', justifyContent:'center'}}>
          <View style={{flex:1, borderRightColor: 'black'}}>
            <View style={{flex:1}}>
              <Text style={[styles.text, {fontSize: vh(25)}]}>{(parseFloat(weight)/1000).toFixed(2)} kg</Text>
              <Text style={styles.text}>{msg}</Text>
            </View>
            <View>
              <TouchableOpacity style={[styles.button, {margin: 20}]}  onPress={() => EndWeight()}><Text style={styles.button_txt}>End</Text></TouchableOpacity>
            </View>
          </View>
          <View style={[{width:200}, styles.inset]}>
            <FlatList
              data={weight_arr}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      </View>
    );
  }
};

var styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: vh(5),
  },
  button: {
    backgroundColor: 'rgb(96, 125, 139)',
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {width: 0,height: 2,},
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
    height: vh(14),
    justifyContent: 'center'
  },
  button_txt: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: vh(10),
  },
  inset: {
    shadowColor: "#000",
    shadowOffset: {width: 0,height: 4,},
    shadowOpacity: 0.9,
    shadowRadius: 3.84,
    elevation: 5,
  }
});

function StartWeight() {
  client.write('weight*');
}

function rfid_error(payload) {
  console.log('rfid_error: ' + payload.toString())
}

module.exports = { WeightScreen };