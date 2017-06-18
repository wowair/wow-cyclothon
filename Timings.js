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
    };
  }

  componentDidMount() {
    setInterval(
      () =>
        this.setState({
          currentTotalSeconds: Math.floor(
            (new Date() - this.state.currentStartDate) / 1000
          ),
          currentStartDate: this.state.currentStartDate,
        }),
      500
    );
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
