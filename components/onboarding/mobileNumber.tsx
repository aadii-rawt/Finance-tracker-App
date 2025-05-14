import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import Feather from '@expo/vector-icons/Feather';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

type Props = {
  onNext: () => void;
};

const MobileNumberStep: React.FC<Props> = ({ onNext }) => {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleContinue = async () => {

    try {
      const sanitizedMobile = mobile.trim().replace(/\D/g, "");
      if (!sanitizedMobile) {
        setError("Please enter your mobile number.");
        return;
      }
      if (sanitizedMobile.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }

      const userRef = doc(db, "users", user?.uid);
      await updateDoc(userRef, {
        mobile: mobile.trim(),
        currentStep: 2,
      });

      console.log('Phone number submitted:', mobile);
      onNext();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topSection}>
            <Text style={styles.title}>Mobile Number</Text>
            <View style={styles.labelRow}>
              <Feather name="phone" size={16} color="black" />
              <Text style={styles.labelText}>  Mobile Number</Text>
            </View>

            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="+91 9999999999"
              value={mobile}
              onChangeText={setMobile}
              placeholderTextColor="#6b7280"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.bottomSection}>

            <View style={styles.stepperContainer}>
              {Array.from({ length: 5 }).map((_, index) => {
                const isActive = index + 1 === 1;
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
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MobileNumberStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  topSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#26897C',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    color: '#4b5563',
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    fontSize: 18,
    borderColor: "#e5e7eb",
  },
  errorText: {
    color: '#ef4444',
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
  bottomSection: {
    paddingBottom: 24, // add padding so keyboard doesn't overlap
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6b7280',
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },
});
