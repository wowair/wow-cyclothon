import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Svg} from 'expo';

// Blatant copy paste from https://stackoverflow.com/a/21279990
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  var R = 637100; // Radius of the earth in meters
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in meters
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
    this.state = {currentIndex: 0};
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

  findClosestCoordinateIndex(data, currentLat, currentLong) {
    const distances = data.points.map(coord =>
      getDistanceFromLatLonInMeters(
        currentLat,
        currentLong,
        coord.lat,
        coord.lon
      )
    );
    return distances.indexOf(Math.min(...distances));
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.location) return;
    const coords = nextProps.location.coords;
    const closestCoordinateIndex = this.findClosestCoordinateIndex(
      nextProps.data,
      coords.latitude,
      coords.longitude
    );
    this.setState({currentIndex: closestCoordinateIndex});
  }

  getMaxElevationScaled(y) {
    // scale max elevation to min of 200 and step
    // it at every 100 (200, 300, 400 , ...)
    if (y > 100) {
      return y - y % 100 + 100;
    } else {
      return 200;
    }
  }

  getDataWindow(data, fromIndex, distance) {
    // distance in meters
    const dataWindow = data.points.slice(fromIndex, data.points.length).reduce((
      result,
      point,
      index
    ) => {
      const copy = {...point};
      if (result.points.length == 0) {
        // first point in window
        copy.total_dist = 0;
        copy.dist = 0;
        result.points.push(copy);
        result.elevation_max = copy.ele;
        result.elevation_min = copy.ele;
        result.distance = 0;
        return result;
      }
      if (result.distance > distance) {
        return result;
      }
      const prev = result.points[result.points.length - 1];
      copy.total_dist = prev.total_dist + copy.dist;
      result.points.push(copy);
      if (copy.ele > result.elevation_max) result.elevation_max = copy.ele;
      if (copy.ele < result.elevation_min) result.elevation_min = copy.ele;
      result.distance = copy.total_dist;
      return result;
    }, {
      points: [],
      distance: null,
      elevation_max: null,
      elevation_min: null,
    });
    // dataWindow.elevation_max = this.getMaxElevationScaled(
    //   dataWindow.elevation_max - dataWindow.elevation_min
    // );
    return dataWindow;
  }

  normalizeDataWindow(data) {
    // shift by extra 3 so that we never `flatline` because it is just ugly
    const extra_shift = 3;
    const elevation_shift = -data.elevation_min + extra_shift;
    const y_size = 10;
    const x_size = 10;
    data.elevation_min = 0;
    data.elevation_max = data.elevation_max + elevation_shift;
    data.elevation_max = this.getMaxElevationScaled(data.elevation_max);

    const elevation_div = (data.elevation_max + elevation_shift) / y_size;

    data.distance = data.distance;
    const distance_div = data.distance / x_size;
    data.points.forEach(point => {
      // shift and normalize elevation data
      point.ele = point.ele + elevation_shift;
      point.nele = point.ele / elevation_div;
      // normalize distance data
      point.ndist = point.dist / distance_div;
      point.total_ndist = point.total_dist / distance_div;
    });
    data.nelevation_max = y_size;
    data.nelevation_min = 0;
    data.ndistance_max = x_size;
    data.ndistance_min = 0;
    data.grid = [];
    return data;
  }

  render() {
    console.log('Render ElevationGraph');
    const location = this.props.location;
    if (!location) {
      return (
        <View style={styles.container}>
          <Text>ERROR: Missing location data</Text>
        </View>
      );
    }
    const currentIndex = this.state.currentIndex;
    const distance = 30 * 1000;
    const window = this.getDataWindow(this.props.data, currentIndex, distance);
    console.log(`min:${window.elevation_min} max:${window.elevation_max}`);

    const nwindow = this.normalizeDataWindow(window);
    console.log(`min:${nwindow.elevation_min} max:${nwindow.elevation_max}`);

    const points = nwindow.points;
    const path =
      points.reduce((currentPath, coord, index) => {
        return `${currentPath} ${currentPath
          ? 'L'
          : 'M'} ${coord.total_ndist} ${nwindow.nelevation_max - coord.nele}`;
      }, '') +
      `L${nwindow.ndistance_max} ${nwindow.nelevation_max} ` +
      `L${nwindow.ndistance_min} ${nwindow.nelevation_max} ` +
      `Z`;

    return (
      <View
        style={styles.container}
        width={this.props.width}
        height={this.props.height}
      >
        <Svg
          height={this.props.height}
          width={this.props.width}
          viewBox={`0 0 ${nwindow.ndistance_max} ${nwindow.nelevation_max}`}
          preserveAspectRatio={'none'}
        >
          <Svg.Path d={path} fill="black" />
        </Svg>
      </View>
    );
  }
}
