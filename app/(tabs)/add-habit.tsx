import { databases, HABITS_COLLECTION_ID,DATABASE_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, TextInput, useTheme } from "react-native-paper";

const FREQUENCIES = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];
type Frequency = (typeof FREQUENCIES)[number];

const Addhabit = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>(FREQUENCIES[0]);
  const [error, setError] = useState<string>("");
  const {user} = useAuth();
  const router = useRouter();

  const handleSubmit = async() => {
        if(!user) return;
    try {
        
    
    await databases.createDocument(
      DATABASE_ID!,
      HABITS_COLLECTION_ID!,
      ID.unique(),
      {
        user_id: user.$id, 
        title,
        description,
        frequency: frequency.value,
        streak_count: 0,
        last_completed: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
    );

    router.back();
} catch (error){
    if (error instanceof Error){
        setError(error.message)
        return;
    }
    setError("There was an error adding the habit. Please try again later.");
    console.error("Error adding habit:", error);
    // Optionally, you can show an alert or toast to the user
    // Alert.alert("Error", "There was an error adding the habit. Please try again later.");
}
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label="Title"
          mode="outlined"
          style={styles.input}
          onChangeText={setTitle}
          textColor="#000000" 
        />
        <TextInput
          label="Description"
          mode="outlined"
          style={styles.input}
          onChangeText={setDescription}
          textColor="#000000" 
          multiline
          numberOfLines={3}
        />
        <View style={styles.frequenci}>
          <SegmentedButtons
            value={frequency.value}
            onValueChange={(value) => setFrequency(FREQUENCIES.find(f => f.value === value) || FREQUENCIES[0])}
            buttons={FREQUENCIES}
            style={styles.segmentedButtons}
          />
        </View>
        <Button mode="contained" style={styles.button} disabled={!title || !description} onPress={handleSubmit}>
          Add Habit
        </Button>
        {error &&  <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "center",
    paddingBottom: 40, 
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  frequenci: {
    marginBottom: 24,
    backgroundColor: "#ffffff",
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#6200ee",
  },
  errorText: {
    color: "#d32f2f", 
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});

export default Addhabit;