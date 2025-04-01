import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';
import { decryptData } from '../utils/encryption';
import DropDown from "../components/dropDown";

const CreateBankModal = ({ visible, onClose, fetchBanks }) => {
  const { user, setNotification } = useAuth();
  const [form, setForm] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    accountType: '',
    createDate: new Date().toISOString().split('T')[0],
    initialBalance: '',
  });

  const translateY = useRef(new Animated.Value(500)).current;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowContent(true); // show content before starting the animation
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowContent(false); // hide content after animation out
      });
    }
  }, [visible]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const saveBank = async () => {
    if (!form.accountName || !form.accountNumber || !form.bankName || !form.accountType) {
      return setNotification({ msg: 'Please fill all required fields.', type: 'error' });
    }

    const userRef = doc(db, 'banks', decryptData(user.uid));
    const docSnap = await getDoc(userRef);
    const banks = docSnap.exists() ? docSnap.data().banks || [] : [];

    const duplicate = banks.find(b => b.accountName.toLowerCase() === form.accountName.toLowerCase());
    if (duplicate) return setNotification({ msg: 'Bank name already exists.', type: 'error' });

    const newBank = { ...form, initialBalance: parseFloat(form.initialBalance) || 0, bankId: Date.now().toString() };

    if (docSnap.exists()) await updateDoc(userRef, { banks: [...banks, newBank] });
    else await setDoc(userRef, { banks: [newBank] });

    setNotification({ msg: 'Bank created successfully!', type: 'success' });
    fetchBanks();
    onClose();
    setForm({
      accountName: '',
      accountNumber: '',
      bankName: '',
      accountType: '',
      createDate: new Date().toISOString().split('T')[0],
      initialBalance: '',
    });
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.modalContainer}>
        {showContent && (
          <Animated.View style={[styles.modalContent, { transform: [{ translateY }] }]}>
            <Text style={styles.title}>Create Bank</Text>

            <TextInput placeholder="Account Name" style={styles.input} value={form.accountName} onChangeText={(t) => handleChange('accountName', t)} />
            <TextInput placeholder="Account Number" keyboardType="number-pad" style={styles.input} value={form.accountNumber} onChangeText={(t) => handleChange('accountNumber', t)} />
            <TextInput placeholder="Bank Name" style={styles.input} value={form.bankName} onChangeText={(t) => handleChange('bankName', t)} />
            <DropDown data={["Saving","Current","Salary"]} SetFormData={setForm} keyName="accountType" placeholder="Account Type" />

            {/* <TextInput placeholder="Account Type (Savings / Current / Salary)" style={styles.input} value={form.accountType} onChangeText={(t) => handleChange('accountType', t)} /> */}
            <TextInput placeholder="Initial Balance (optional)" keyboardType="numeric" style={styles.input} value={form.initialBalance} onChangeText={(t) => handleChange('initialBalance', t)} />

            <View style={styles.row}>
              <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: '#ccc' }]}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveBank} style={styles.button}><Text style={{ color: '#fff' }}>Save</Text></TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

export default CreateBankModal;

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginVertical: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  button: { padding: 12, borderRadius: 8, backgroundColor: '#26897C', flex: 1, marginHorizontal: 5, alignItems: 'center' },
});
