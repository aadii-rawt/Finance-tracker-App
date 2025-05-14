import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Props = {
  onNext: () => void;
};

const CashAmount: React.FC<Props> = ({ onNext }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth()

  const handleContinue = async () => {

    if (!amount) {
      const userRef = doc(db, "users", user?.uid);
      await updateDoc(userRef, {
        currentStep: 3,
      });
      onNext()
      return
    }

    try {
      const bankRef = doc(db, 'banks', user?.uid);
      const bankSnap = await getDoc(bankRef);

      const data = bankSnap.data();
      const banks = data?.banks || [];

      const updatedBanks = banks.map((account: any) => {
        if (account.accountType === 'Cash') {
          return {
            ...account,
            initialBalance: parseFloat(amount),
          };
        }
        return account;
      });

      await updateDoc(bankRef, {
        banks: updatedBanks,
      });

      const userRef = doc(db, "users", user?.uid);
      await updateDoc(userRef, {
        currentStep: 3,
      });

      console.log('Cash account balance updated.');
      // onNext();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.wrapper}>
          {/* Scrollable input section */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.topSection}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Initial Cash Amount</Text>
            <Text style={styles.labelText}>Amount</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="e.g. ₹500"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#6b7280"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          {/* Fixed bottom section */}
          <View style={styles.bottomSection}>

            <View style={styles.stepperContainer}>
              {Array.from({ length: 5 }).map((_, index) => {
                const isActive = index + 1 === 3;
                return (
                  <View
                    key={index}
                    style={[
                      styles.stepDot,
                      isActive ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                );
              })}
            </View>

            <TouchableOpacity onPress={handleContinue} style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>

          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default CashAmount;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    flex: 1,
  },
  topSection: {
    padding: 24,
    flexGrow: 1,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#26897C",
    marginBottom: 8,
  },
  labelText: {
    color: "#4b5563",
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 12,
    borderWidth: 1,
    fontSize: 18,
    borderColor: "#e5e7eb",
    color: "#000000",
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 8,
  },

  button: {
    backgroundColor: '#26897C',
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 21,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#6b7280",
  },
  inactiveDot: {
    backgroundColor: "#d1d5db",
  },
});
