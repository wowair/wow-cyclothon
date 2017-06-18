import React from 'react';
import {StyleSheet, View, Dimensions, StatusBar, Text} from 'react-native';
import {Permissions, Location} from 'expo';

import coordinates from './cyclothonCoordinates';
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
    this.setupFakeLocation();
  }

  updateFakeLocation() {
    var locationIndex = !this.state.locationIndex
      ? 0
      : this.state.locationIndex;

    const point = coordinates.points[locationIndex % coordinates.points.length];
    const speeds = [0, 20, 25, 0, 0, 30].map(s => {
      return s / 3.6;
    });
    const speed = speeds[locationIndex % speeds.length];
    this.setState({
      locationIndex: locationIndex + 1,
      location: {
        coords: {
          latitude: point.lat,
          longitude: point.lon,
          speed: speed,
        },
      },
    });
  }

  setupFakeLocation() {
    this.updateFakeLocation();
    setInterval(this.updateFakeLocation.bind(this), 5000);
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

  setupGPSLocation() {
    this.updateLocation();
    setInterval(() => {
      this.updateLocation();
    }, 10000);
  }

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
          <Timings location={this.state.location} />
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
