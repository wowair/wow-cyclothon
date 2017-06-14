import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {Svg, Permissions, Location} from 'expo';
import coordinates from './cyclothonCoordinates';

console.ignoredYellowBox = ['Warning: View.propTypes'];

// Blatant copy paste from https://stackoverflow.com/a/21279990
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {errorMessage: null, lastIndex: 0};
  }

  componentDidMount() {
    this.getLocationAsync();
    setInterval(() => {
      this.getLocationAsync();
    }, 10000);
  }

  findClosestCoordinateIndex(currentLat, currentLong) {
    const distances = coordinates.points
      .slice(this.state.lastIndex, coordinates.points.length)
      .map(coord =>
        getDistanceFromLatLonInKm(currentLat, currentLong, coord.lat, coord.lon)
      );
    return distances.indexOf(Math.min(...distances));
  }

  getLocationAsync = async () => {
    let {status} = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    let closestCoordinateIndex = this.findClosestCoordinateIndex(
      location.coords.latitude,
      location.coords.longitude
    );
    this.setState({lastIndex: closestCoordinateIndex});
  };

  render() {
    if (this.state.errorMessage) {
      return (
        <View style={styles.container}>
          <Text>{this.state.errorMessage}</Text>
        </View>
      );
    }
    console.log(coordinates.points[this.state.lastIndex]);
    const {height, width} = Dimensions.get('window');
    const path = coordinates.points
      .slice(this.state.lastIndex, this.state.lastIndex + width)
      .reduce(
        (currentPath, coord, index) =>
          `${currentPath} L${index} ${Math.ceil(height - coord.ele)}`,
        ''
      );
    return (
      <View style={styles.container}>
        <Svg height={height} width={width}>
          <Svg.Path d={`M0 ${height} ${path}`} fill="none" stroke="red" />
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
