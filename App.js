import React from "react";
import { StyleSheet, View, Dimensions, StatusBar, Text } from "react-native";
import ElevationGraph from "./ElevationGraph";

console.ignoredYellowBox = ["Warning: View.propTypes"];

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { errorMessage: null };
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <View style={styles.container}>
          <Text>{this.state.errorMessage}</Text>
        </View>
      );
    }
    const { height, width } = Dimensions.get("window");

    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <View style={{ flex: 1, flexDirection: "column" }}>
          <ElevationGraph height={height * 0.75} width={width} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff"
  }
});
