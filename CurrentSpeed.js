import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

const convertMetersPerSecondToKmPerHour = speedInMetersPerSecond =>
  speedInMetersPerSecond * 3.6;

export default class CurrentSpeed extends React.Component {
  constructor() {
    super();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const location = this.props.location;
    if (!location && nextProps.location) {
      return true;
    }

    const nextSpeed = nextProps.location.coords.speed;
    const currentSpeed = this.props.location.coords.speed;
    if (nextSpeed == currentSpeed) {
      return false;
    }
    return true;
  }

  render() {
    console.log('Render CurrentSpeed');
    const location = this.props.location;
    if (!location) {
      return (
        <View style={styles.container}>
          <Text>ERROR: Missing location data</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {location && location.coords.speed > 0
            ? Math.ceil(
                convertMetersPerSecondToKmPerHour(location.coords.speed)
              )
            : 0}
          {' '}km/h
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  text: {
    margin: 10,
    fontSize: 40,
  },
});
