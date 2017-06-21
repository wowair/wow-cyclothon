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
  // route stats
  // max elevation: 592
  // min elevation: -1
  constructor() {
    super();
    this.state = {currentIndex: 0};
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.distance != this.props.distance) {
      return true;
    }

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

  getDataWindow(data, fromIndex, distance) {
    // distance in meters
    const dataWindow = data.points
      .slice(fromIndex > 1 ? fromIndex - 1 : fromIndex, data.points.length)
      .reduce(
        (result, point, index) => {
          const copy = {...point};
          if (result.points.length == 0) {
            // first point in window
            copy.total_dist = 0;
            copy.dist = 0;
            result.points.push(copy);
            result.elevation_max = copy.ele;
            result.elevation_min = copy.ele;
            result.distance_max = 0;
            return result;
          }
          if (result.distance_max >= distance) {
            return result;
          }
          const prev = result.points[result.points.length - 1];
          copy.total_dist = prev.total_dist + copy.dist;
          result.points.push(copy);
          if (copy.ele > result.elevation_max) result.elevation_max = copy.ele;
          if (copy.ele < result.elevation_min) result.elevation_min = copy.ele;
          result.distance_max = copy.total_dist;
          return result;
        },
        {
          points: [],
          distance_max: null,
          distance_min: 0,
          elevation_max: null,
          elevation_min: null,
        }
      );
    return dataWindow;
  }

  getGrid(width, widthStep, height, heightStep, heightOffset) {
    const lines = [];
    for (let w = 0; w < width; w += widthStep) {
      lines.push({
        x1: w,
        y1: 0,
        x2: w,
        y2: height,
      });
    }

    for (let h = heightOffset; h < height; h += heightStep) {
      lines.push({
        x1: 0,
        y1: h,
        x2: width,
        y2: h,
      });
    }
    for (let h = heightOffset - heightStep; h > 0; h -= heightStep) {
      lines.push({
        x1: 0,
        y1: h,
        x2: width,
        y2: h,
      });
    }

    // console.log(`line count: ${lines.length}`);
    // console.log(lines);
    return lines;
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

  normalizeDataWindow(data) {
    // normalize data to [0, 1] and scale to what ever y_scale and x_scale.
    // y range -> [0, y_scale]
    // x range -> [0, x_scale]

    const y_scale = 1000;
    const x_scale = 1000;

    // extra_bottom_shift - shift data by this to avoid flat line at bottom
    // extra_top_shift    - make y axis bigger to avoid flat line at top
    const extra_bottom_shift = 3;
    const extra_top_shift = 3;
    const elevation_shift = -data.elevation_min + extra_bottom_shift;
    data.elevation_min = 0;
    data.elevation_max = data.elevation_max + elevation_shift + extra_top_shift;
    data.elevation_max = this.getMaxElevationScaled(data.elevation_max);

    // console.log(
    //   `elevation min:${data.elevation_min} max:${data.elevation_max} shift:${elevation_shift}`
    // );
    // console.log(`distance min:${data.distance_min} max:${data.distance_max}`);
    data.points.forEach(point => {
      // shift and normalize elevation data
      point.ele = point.ele + elevation_shift;
      point.nele = point.ele / data.elevation_max * y_scale;

      // normalize distance data
      point.ndist = point.dist / data.distance_max * x_scale;
      point.total_ndist = point.total_dist / data.distance_max * x_scale;
    });

    // console.log(`point:${data.points[data.points.length - 1].nele}`);
    data.nelevation_max = y_scale;
    data.nelevation_min = 0;
    data.ndistance_max = x_scale;
    data.ndistance_min = 0;

    const y_grid_offset = y_scale - data.points[0].nele;
    const y_grid_large_width = 100 / data.elevation_max * y_scale;
    const x_grid_large_width = 5000 / data.distance_max * x_scale;
    // console.log(
    //   `x_grid_large_width:${x_grid_large_width} y_grid_large_width:${y_grid_large_width}`
    // );
    data.gridLarge = this.getGrid(
      x_scale,
      x_grid_large_width,
      y_scale,
      y_grid_large_width,
      y_grid_offset
    );

    const y_grid_small_width = 50 / data.elevation_max * y_scale;
    const x_grid_small_width = 2500 / data.distance_max * x_scale;
    // console.log(
    //   `x_grid_small_width:${x_grid_small_width} y_grid_small_width:${y_grid_small_width}`
    // );
    data.gridSmall = this.getGrid(
      x_scale,
      x_grid_small_width,
      y_scale,
      y_grid_small_width,
      y_grid_offset
    );

    return data;
  }

  renderGrid(grid, stroke, strokeWidth) {
    let key = 0;
    return grid.map(grid => {
      key += 1;
      return (
        <Svg.Line
          x1={`${grid.x1}`}
          y1={`${grid.y1}`}
          x2={`${grid.x2}`}
          y2={`${grid.y2}`}
          stroke={`${stroke}`}
          strokeWidth={`${strokeWidth}`}
          key={`${key}`}
        />
      );
    });
  }

  render() {
    // console.log('Render ElevationGraph');
    const location = this.props.location;
    if (!location) {
      return (
        <View style={styles.container}>
          <Text>ERROR: Missing location data</Text>
        </View>
      );
    }
    const currentIndex = this.state.currentIndex;
    const distance = this.props.distance * 1000;
    const window = this.getDataWindow(this.props.data, currentIndex, distance);
    // console.log(`min:${window.elevation_min} max:${window.elevation_max}`);

    const nwindow = this.normalizeDataWindow(window);
    // console.log(`o min:${nwindow.elevation_min} max:${nwindow.elevation_max}`);
    // console.log(
    //   `n min:${nwindow.nelevation_min} max:${nwindow.nelevation_max}`
    // );
    const points = nwindow.points;
    const path =
      points.reduce((currentPath, point, index) => {
        return `${currentPath} ${currentPath
          ? 'L'
          : 'M'} ${point.total_ndist} ${nwindow.nelevation_max - point.nele}`;
      }, '') +
      ` L ${nwindow.ndistance_max} ${nwindow.nelevation_max} ` +
      `L ${nwindow.ndistance_min} ${nwindow.nelevation_max} ` +
      `Z`;
    // console.log(path);
    //
    const textX = 900;
    const textY = 950;
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
          {this.renderGrid(nwindow.gridSmall, '#C0C0C0', 2)}
          {this.renderGrid(nwindow.gridLarge, '#606060', 4)}
          <Svg.Text
            stroke="red"
            fontSize="20"
            x={`${textX}`}
            y={`${textY}`}
            textAnchor="middle"
          >
            Hæðargögn: LMÍ
          </Svg.Text>
        </Svg>
      </View>
    );
  }
}
