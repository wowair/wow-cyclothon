import React from 'react';
import {StyleSheet, View, Dimensions, StatusBar, Text} from 'react-native';
import {Permissions, Location, KeepAwake} from 'expo';

import RouteData from './data';
import CurrentSpeed from './CurrentSpeed';
import ElevationGraph from './ElevationGraph';
import Timings from './Timings';
import DistanceSelector from './DistanceSelector';

console.ignoredYellowBox = ['Warning: View.propTypes'];

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      distance: 30,
    };
  }

  componentDidMount() {
    this.setupGPSLocation();
  }

  updateFakeLocation() {
    var locationIndex = !this.state.locationIndex
      ? 0
      : this.state.locationIndex;

    const points = RouteData.points;
    const point = points[locationIndex % points.length];
    const speeds = [0, 20, 25, 0, 0, 30].map(s => {
      return s / 3.6;
    });
    const speed = speeds[locationIndex % speeds.length];
    // console.log(`locationIndex:${locationIndex + 10}`);
    this.setState({
      locationIndex: locationIndex + 10,
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
    setInterval(this.updateFakeLocation.bind(this), 1000);
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

  decreaseDistance() {
    if (this.state.distance <= 5) return;
    this.setState({
      distance: this.state.distance - 5,
    });
  }

  increaseDistance() {
    this.setState({
      distance: this.state.distance + 5,
    });
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
          data={RouteData}
          location={this.state.location}
          distance={this.state.distance}
          height={height * 0.8}
          width={width}
        />
        <View style={styles.stats}>
          <CurrentSpeed location={this.state.location} />
          <Timings location={this.state.location} />
          <DistanceSelector
            decreaseHandler={this.decreaseDistance.bind(this)}
            increaseHandler={this.increaseDistance.bind(this)}
            currentDistance={this.state.distance}
          />
        </View>
        <KeepAwake />
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
