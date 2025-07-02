import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { signUp, signIn } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Email and Password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);

    if (isSignUp) {
      const error = await signUp(email, password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      }

      router.replace("/(tabs)/login");
    }
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Text>
        <TextInput
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@gmail.com"
          mode="outlined"
          onChangeText={setEmail}
        />

        <TextInput
          label="Password"
          autoCapitalize="none"
          secureTextEntry
          placeholder="Enter your password"
          mode="outlined"
          onChangeText={setPassword}
        />

        {error && <Text style={{ color: "red" }}>{error}</Text>}

        <Button mode="contained" onPress={handleAuth}>
          {isSignUp ? "SignUp" : "SignIn"}{" "}
        </Button>
        <Button mode="text" onPress={handleSwitchMode}>
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  title: {
    textAlign: "center",
  },
});

export default AuthScreen;
