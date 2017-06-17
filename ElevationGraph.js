import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Svg, Permissions, Location} from 'expo';
import coordinates from './cyclothonCoordinates';

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderStyle: 'solid',
    borderWidth: 1,
  },
});

export default class ElevationGraph extends React.Component {
  constructor() {
    super();
    this.state = {lastIndex: 0};
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
    const height = this.props.height;
    const width = this.props.width;
    const path = coordinates.points
      .slice(this.state.lastIndex, this.state.lastIndex + width)
      .reduce(
        (currentPath, coord, index) =>
          `${currentPath} L${index} ${Math.ceil(250 - coord.ele)}`,
        'M0 0'
      );
    return (
      <View style={styles.container} width={width} height={height}>
        <Svg height={height} width={width}>
          <Svg.Path
            d={`M0 ${height} H${width}`}
            fill={'none'}
            stroke={'black'}
            strokeWidth={3}
          />
          <Svg.Path d={path} fill="none" stroke="black" />
        </Svg>
      </View>
    );
  }
}
