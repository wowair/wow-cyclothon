import React from 'react';

import {ListView, StyleSheet, View, Text} from 'react-native';
import TimeAgo from 'react-native-timeago';

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

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export default class Timings extends React.Component {
  constructor() {
    super();
    this.state = {
      currentTotalSeconds: 0,
      currentStartDate: new Date(),
      currentSpeed: 0,
    };
  }

  componentDidMount() {
    setInterval(this.updateCurrentTimer.bind(this), 500);
  }

  resetCurrentTimer(speed) {
    this.setState({
      currentTotalSeconds: 0,
      currentStartDate: new Date(),
      currentSpeed: speed,
    });
  }

  tickCurrentTimer(speed) {
    this.setState({
      currentTotalSeconds: Math.floor(
        (new Date() - this.state.currentStartDate) / 1000
      ),
      currentStartDate: this.state.currentStartDate,
      currentSpeed: speed,
    });
  }

  updateCurrentTimer() {
    curSpeed = this.state.currentSpeed;
    nextSpeed = this.props.location ? this.props.location.coords.speed : 0;
    if (nextSpeed > 0 && curSpeed == 0) {
      this.resetCurrentTimer(nextSpeed);
    } else {
      this.tickCurrentTimer(nextSpeed);
    }
  }

  format(totalSeconds) {
    const seconds = totalSeconds % 60;
    const minutes = totalSeconds < 60 ? 0 : Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    return `${hours}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {this.format(this.state.currentTotalSeconds)}
        </Text>
      </View>
    );
  }
}
