import React, { Component } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ListItem, SearchBar, Avatar } from 'react-native-elements';

import { getDBConnection, checkCreateTables, getEmployeeItems, getFieldItems, getAssetItems, saveEmployeeItems, saveFieldItems, saveAssetItems } from '../services/db-service';


class SearchableFlatList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: [],
      error: null,
    };

    this.arrayholder = [];
  }

  componentDidMount() {
    this.makeRemoteRequest();
  }

  makeRemoteRequest = async () => {
    this.setState({ loading: true });
    var results = []
    const db = await getDBConnection();
    // result = await checkCreateTables();
    if (this.props.model == 'employee') {
        results = await getEmployeeItems(db);
        if (!results.length) {
            results = [
                {'id': 0, 'value': 'John Doe', 'rfid': 'AA'},
                {'id': 1, 'value': 'Jane Doe', 'rfid': 'AA'},
                {'id': 2, 'value': 'Jan Jansen', 'rfid': 'AA'},
            ]
            await saveEmployeeItems(db, results);
        }
    } else if (this.props.model == 'field') {
        results = await getFieldItems(db);
        if (!results.length) {
            results = [
                {'id': 0, 'value': 'Hill Field'},
                {'id': 1, 'value': 'World Record Field'},
                {'id': 2, 'value': 'Limbo Swamp'},
            ]
            await saveFieldItems(db, results);
        }
    } else if (this.props.model == 'asset') {
        results = await getAssetItems(db);
        if (!results.length) {
            results = [
                {'id': 0, 'value': 'Tractor'},
                {'id': 1, 'value': 'Trailor'},
                {'id': 2, 'value': 'Donkey Cart'},
            ]
            await saveAssetItems(db, results);
        }
    }
    this.setState({
        data: results,
        error: null,
        loading: false,
    });
    this.arrayholder = results;
  };

  searchFilterFunction = text => {
    this.setState({
      value: text,
    });

    const newData = this.arrayholder.filter(item => {
      const itemData = `${item.value.toUpperCase()}`;
      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      data: newData,
    });
  };

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Type Here..."
        lightTheme
        round
        onChangeText={text => this.searchFilterFunction(text)}
        autoCorrect={false}
        value={this.state.value}
      />
    );
  };

  
  renderItem = ({ item }) => (
    <ListItem style={{backgroundColor: 'green'}} bottomDivider>
      {/* <Avatar title="MD" /> */}
      <ListItem.Content style={{backgroundColor: 'green'}}>
        <TouchableOpacity style={{backgroundColor: 'green'}} onPress={() => {
          navigation.navigate('Weight', {
            model: 'employee',
            params: { 
              child_model: this.props.model,
              child_id: item.id,
              child_value: item.value,
            },
            merge: true,
          });}}>
          <Text style={{backgroundColor: 'green'}}>{item.value}</Text>
        </TouchableOpacity>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  )

  render() {
    if (this.state.loading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }
    
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state.data}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={this.renderHeader}
        />
      </View>
    );
  }
}

export default SearchableFlatList;