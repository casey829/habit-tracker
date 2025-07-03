import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";

const FREQUENCIES = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

const Addhabit = () => {
  return (
    <View style={styles.container}>
      <TextInput label="Title" mode="outlined" style={styles.input} />
      <TextInput label="Description" mode="outlined" style={styles.input} />
      <View style={styles.frequency}>
        <SegmentedButtons
          buttons={FREQUENCIES}
          style={styles.segmentedButtons}
        />
      </View>
      <Button mode="contained" style={styles.button}>
        Add Habit
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "f5f5f5",
    textAlign: "center",
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "f5f5f5",
  },
  frequency: {
    marginBottom: 24,
    backgroundColor: "f5f5f5",
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});

export default Addhabit;
