import React from 'react';
import {StyleSheet, View, Dimensions, StatusBar, Text} from 'react-native';

import CurrentSpeed from './CurrentSpeed';
import ElevationGraph from './ElevationGraph';
import Timings from './Timings';

console.ignoredYellowBox = ['Warning: View.propTypes'];

export default class App extends React.Component {
  constructor() {
    super();
  }

  render() {
    const {height, width} = Dimensions.get('window');

    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <View style={{flex: 1, flexDirection: 'column'}}>
          <ElevationGraph height={height * 0.75} width={width} />
          <View style={{flex: 1, flexDirection: 'row'}}>
            <CurrentSpeed />
            <Timings />
          </View>
        </View>
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
});
