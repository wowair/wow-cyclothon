import React from 'react';
import {StyleSheet, View, Dimensions, StatusBar, Text} from 'react-native';
import {Permissions, Location} from 'expo';

import CurrentSpeed from './CurrentSpeed';
import ElevationGraph from './ElevationGraph';
import Timings from './Timings';

console.ignoredYellowBox = ['Warning: View.propTypes'];

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.updateLocation();
    setInterval(() => {
      this.updateLocation();
    }, 10000);
  }

  updateLocation = async () => {
    let {status} = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({location: location});
  };

  render() {
    if (this.state.errorMessage) {
      return (
        <View style={styles.container}>
          <Text>{this.state.errorMessage}</Text>
        </View>
      );
    }
    const {height, width} = Dimensions.get('window');
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <ElevationGraph
          location={this.state.location}
          height={height * 0.75}
          width={width}
        />
        <View style={styles.stats}>
          <CurrentSpeed location={this.state.location} />
          <Timings />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
  },
});
