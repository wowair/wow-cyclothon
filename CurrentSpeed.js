import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Permissions, Location} from 'expo';

const convertMetersPerSecondToKmPerHour = speedInMetersPerSecond =>
  speedInMetersPerSecond * 3.6;

export default class CurrentSpeed extends React.Component {
  constructor() {
    super();
    this.state = {location: null};
  }

  componentDidMount() {
    this.getLocationAsync();
    setInterval(() => {
      this.getLocationAsync();
    }, 1000);
  }

  getLocationAsync = async () => {
    let {status} = await Permissions.askAsync(Permissions.LOCATION);
    let location = await Location.getCurrentPositionAsync({});
    this.setState({location});
  };

  render() {
    const {location} = this.state;
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
