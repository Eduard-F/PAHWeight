import type, {Node} from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import {Text, View, Button, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';
import NFC from "react-native-rfid-nfc-scanner";

import { getDBConnection, getEmployeeItems, getFieldItems, getAssetItems, saveEmployeeItems, saveFieldItems, saveAssetItems } from '../services/db-service';


const DropdownListScreen = ({ route, navigation }) => {
  const { model, rfid, location } = route.params;
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [state, setState] = useState({
    loading: false,
    data: [],
    error: null,
  });
  const [arrayholder, setArrayholder] = useState([]);


  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerRight: () => (
            <Button onPress={() => QrCode()} title="QR" />
        ),
    });
}, [navigation]);

  function rfid_callback(payload) {
    setMsg(payload.id)
    console.log("id: " + payload.id)
  }

  function QrCode() {
    navigation.navigate({
      name: 'QRCode',
      params: {
        child_model: model
      }
    });
  }
  
  useEffect(() => {
    makeRemoteRequest();
    if (rfid) {
      NFC.initialize();
      NFC.removeAllListeners();
      NFC.addListener('dropdown', rfid_callback, rfid_error);
      navigation.addListener('blur', () => {NFC.removeListener('dropdown'); console.log('dropdown remove on blur')})
      navigation.addListener('beforeRemove', (e) => {
        console.log('dropdown beforeRemove');
        NFC.removeAllListeners();
      })
    }
  },[]);

  makeRemoteRequest = async () => {
    setState({ loading: true });
    var results = []
    const db = await getDBConnection();
    if (model == 'employee') {
        results = await getEmployeeItems(db);
    } else if (model == 'field') {
        results = await getFieldItems(db);
    } else if (model == 'asset') {
        results = await getAssetItems(db);
    }
    setState({
        data: results,
        error: null,
        loading: false,
    });
    setArrayholder(results);
  };

  searchFilterFunction = text => {
    setSearch(text)
  };

  renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
      navigation.navigate({
        name: 'Weight',
        params: { 
          child_model: model,
          child_id: item.id,
          child_value: item.value,
        },
        merge: true,
      });}}>
      <ListItem bottomDivider>
        {/* <Avatar title="MD" /> */}
        <ListItem.Content>
          <Text>{item.value}</Text>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </TouchableOpacity>
  )


  if (state.loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={state.data.filter(item => {
          const itemData = `${item.value.toUpperCase()}`;
          const textData = search.toUpperCase();
    
          return itemData.indexOf(textData) > -1;
        })}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <SearchBar
            placeholder="Type Here..."
            lightTheme
            round
            onChangeText={text => searchFilterFunction(text)}
            autoCorrect={false}
            value={search}
          />
        }
      />
    </View>
  );
};

var styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  button: {
    backgroundColor: 'rgb(96, 125, 139)',
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {width: 0,height: 2,},
    shadowOpacity: 0.4,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button_txt: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  inset: {
    shadowColor: "#000",
    shadowOffset: {width: 0,height: 4,},
    shadowOpacity: 0.9,
    shadowRadius: 3.84,
    elevation: 5,
  }
});

function rfid_error(payload) {
  console.log(payload.toString())
}

module.exports = { DropdownListScreen };