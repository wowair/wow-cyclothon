import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Svg} from 'expo';
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
  },
});

export default class ElevationGraph extends React.Component {
  constructor() {
    super();
    this.state = {lastIndex: 0};
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.width != this.props.width ||
      nextProps.height != this.props.height
    ) {
      return true;
    }

    const location = this.props.location;
    if (!location && nextProps.location) {
      return true;
    }

    const coords = this.props.location.coords;
    const nextCoords = nextProps.location.coords;
    if (
      nextCoords.latitude != coords.latitude ||
      nextCoords.longitude != coords.longitude
    ) {
      return true;
    }
    return false;
  }

  findClosestCoordinateIndex(currentLat, currentLong) {
    const distances = coordinates.points
      .slice(this.state.lastIndex, coordinates.points.length)
      .map(coord =>
        getDistanceFromLatLonInKm(currentLat, currentLong, coord.lat, coord.lon)
      );
    return distances.indexOf(Math.min(...distances));
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.location) return;
    const coords = nextProps.location.coords;
    const closestCoordinateIndex = this.findClosestCoordinateIndex(
      coords.latitude,
      coords.longitude
    );
    this.setState({lastIndex: closestCoordinateIndex});
  }

  render() {
    const location = this.props.location;
    console.log('Render ElevationGraph');
    if (!location) {
      return (
        <View style={styles.container}>
          <Text>ERROR: Missing location data</Text>
        </View>
      );
    }

    const path = coordinates.points
      .slice(this.state.lastIndex, this.state.lastIndex + this.props.width)
      .reduce(
        (currentPath, coord, index) =>
          `${currentPath} L${index} ${Math.ceil(250 - coord.ele)}`,
        'M0 0'
      );
    return (
      <View
        style={styles.container}
        width={this.props.width}
        height={this.props.height}
      >
        <Svg height={this.props.height} width={this.props.width}>
          <Svg.Path d={path} fill="none" stroke="black" />
          <Svg.Path
            d={`M0 ${this.props.height} H${this.props.width}`}
            fill={'none'}
            stroke={'black'}
            strokeWidth={3}
          />
        </Svg>
      </View>
    );
  }
}
