import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Link } from "expo-router";

const Signup = () => {
  return (
    <View style={styles.container}>
      {/* Card */}
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Create an account so you can explore all the features
        </Text>

        {/* Email */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={[styles.input]}
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
        />

        {/* Confirm Password */}
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
        />

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        {/* Already have an account */}
        <Link href="/login" style={styles.bottomText}>
          Already have an account
        </Link>
      </View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    padding: 25,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#195A5A",
    marginBottom: 5,
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 20,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    fontSize : 18,
    borderColor: "#e5e7eb",
  },
  button: {
    backgroundColor: "#26897C",
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize : 18,
  },
  bottomText: {
    color: "#26897C",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,

  },
  orText: {
    textAlign: "center",
    marginVertical: 15,
    color: "#9ca3af",
    fontSize: 12,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
});
