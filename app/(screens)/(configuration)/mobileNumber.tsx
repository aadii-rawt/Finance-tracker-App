import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const MobileNumberStep = () => {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    const trimmed = mobile.trim();
    if (!/^[6-9]\d{9}$/.test(trimmed)) {
      setError("Enter a valid 10-digit Indian mobile number.");
    } else {
      setError("");
    //   onNext(trimmed);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center bg-white p-6"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="mb-8">
        <Text className="text-2xl font-bold text-black mb-2">
          Enter Mobile Number
        </Text>
        <Text className="text-gray-600">
          We'll send an OTP for verification.
        </Text>
      </View>

      <TextInput
        className="border border-gray-400 rounded-lg px-4 py-3 text-lg text-black mb-2"
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="e.g. 9876543210"
        value={mobile}
        onChangeText={setMobile}
      />

      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

      <TouchableOpacity
        onPress={handleContinue}
        className="bg-blue-600 py-3 rounded-lg"
      >
        <Text className="text-white text-center text-lg font-semibold">
          Continue
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default MobileNumberStep;
