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
    const distances = data.points
      .slice(this.state.currentIndex, data.points.length)
      .map(coord =>
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
    return dataWindow;
  }

  normalizeDataWindow(data) {
    const distance = data.distance;
    const elevation_shift = -data.elevation_min;
    data.elevation_min = 0;
    data.elevation_max = data.elevation_max + elevation_shift;
    const elevation_max = data.elevation_max;
    data.points.forEach(point => {
      // shift and noramlize elevation data
      point.ele = point.ele + elevation_shift;
      point.nele = point.ele / elevation_max;
      // normalize distance data
      point.ndist = point.dist / distance;
      point.total_ndist = point.total_dist / distance;
    });
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
    if (window.elevation_max < 200) {
      window.elevation_max = 200;
    } else if (window.elevation_max < 300) {
      window.elevation_max = 300;
    } else if (window.elevation_max < 400) {
      window.elevation_max = 400;
    } else if (window.elevation_max < 500) {
      window.elevation_max = 500;
    } else if (window.elevation_max < 600) {
      window.elevation_max = 600;
    }
    const nwindow = this.normalizeDataWindow(window);
    const points = nwindow.points;
    const path =
      points.reduce((currentPath, coord, index) => {
        return `${currentPath} ${currentPath
          ? 'L'
          : 'M'} ${coord.total_ndist} ${1 - coord.nele}`;
      }, '') + 'L1 1 L0 1 Z';
    return (
      <View
        style={styles.container}
        width={this.props.width}
        height={this.props.height}
      >
        <Svg
          height={this.props.height}
          width={this.props.width}
          viewBox={'0 0 1 1'}
          preserveAspectRatio={'none'}
        >
          <Svg.Path d={path} fill="black" />
        </Svg>
      </View>
    );
  }
}
