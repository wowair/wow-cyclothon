import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Button from 'react-native-button';

export default class DistanceSelector extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.container}>
        <Button style={styles.button} onPress={this.props.decreaseHandler}>
          -
        </Button>
        <Text stroke="black" style={styles.text}>
          {`${this.props.currentDistance}`}
        </Text>
        <Button style={styles.button} onPress={this.props.increaseHandler}>
          +
        </Button>
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
  button: {
    color: 'black',
    fontSize: 50,
  },
  text: {
    fontWeight: 'bold',
    margin: 10,
    fontSize: 40,
  },
});
