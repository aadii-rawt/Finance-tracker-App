import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from "react-native-uuid";
type Props = {
  onNext: () => void;
};

const AccountDetailsStep: React.FC<Props> = ({ onNext }) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [createDate, setCreationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [initialBalance, setBalance] = useState('');
  const { user } = useAuth()


  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // keep picker open on iOS
    if (selectedDate) {
      setCreationDate(selectedDate);
    }
  };

  const handleContinue = async () => {
    try {
      const newBank = {
        accountName,
        accountType,
        initialBalance: parseFloat(initialBalance),
        bankId: uuid.v4(),
        createdAt: createDate.toISOString(),
      }
      const bankDocRef = doc(db, 'banks', user?.uid);
      await updateDoc(bankDocRef, {
        banks: arrayUnion(newBank),
      })
      console.log('Bank added successfully');
      onNext();
    } catch (error) {
      console.error('Error adding bank:', error);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Account Details</Text>

        <Text style={styles.label}>Account Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Cash, SBI Savings"
          value={accountName}
          onChangeText={setAccountName}
        />
        <Text style={styles.label}>Account Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={accountType}
            onValueChange={(itemValue) => setAccountType(itemValue)}
          >
            <Picker.Item label="Select type" value="" />
            <Picker.Item label="Bank Account" value="bank" />
            <Picker.Item label="Card" value="card" />
            <Picker.Item label="Debit Card" value="debitCard" />
            <Picker.Item label="Savings" value="savings" />
            <Picker.Item label="Loan" value="loan" />
            <Picker.Item label="Investments" value="investments" />
            <Picker.Item label="Others" value="others" />
          </Picker>
        </View>

        <Text style={styles.label}>Date of Creation</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {createDate.toLocaleDateString('en-GB')}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={createDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text style={styles.label}>Current Balance</Text>
        <TextInput
          style={styles.input}
          placeholder="₹500"
          keyboardType="numeric"
          value={initialBalance}
          onChangeText={setBalance}
        />
        <Text style={styles.subLabel}>Must be a valid number (min: 0)</Text>
      </View>

      <View style={styles.bottomSection}>

        <View style={styles.stepperContainer}>
          {Array.from({ length: 5 }).map((_, index) => {
            const isActive = index + 1 === 2;
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


        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>


      </View>
    </View>
  );
};

export default AccountDetailsStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  content: {
    flexGrow: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#26897C',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
  },
  subLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
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
  },
  pickerContainer: {
    borderWidth: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 15,
    marginBottom: 16,
    paddingVertical: 0,
    overflow: 'hidden',
    borderColor: "#e5e7eb",
  },
  datePickerButton: {
    borderWidth: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 16,
    borderColor: "#e5e7eb",
  },
  dateText: {
    color: '#4b5563',
    fontSize: 16,
  },
  bottomSection: {
    paddingBottom: 24, // add padding so keyboard doesn't overlap
  },
  button: {
    backgroundColor: '#26897C',
    paddingVertical: 14,
    borderRadius: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 21,
    textAlign: 'center',
    fontWeight: '600',
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
