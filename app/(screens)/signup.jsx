import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useRouter } from 'expo-router';
import { auth, db } from '../../firebase';
import { encryptData } from '../../utils/encryption';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const { setUser, setNotification } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      return setNotification({ msg: 'Please fill all fields', type: 'error' });
    }

    if (formData.password.length < 6) {
      return setNotification({ msg: 'Password must be at least 6 characters', type: 'error' });
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.username });

      const userData = {
        uid: user.uid,
        username: formData.username,
        email: formData.email,
        balance: 0,
      };

      const encryptedUserData = encryptData(userData);
      const banks = {
        banks: [
          {
            accountName: 'Cash',
            accountType: 'Cash',
            bankId: Date.now().toString(),
            initialBalance: 0,
          },
        ],
      };

      const categories = {
        category: [
          { category: 'food', type: 'expense' },
          { category: 'transport', type: 'expense' },
          { category: 'beauty', type: 'expense' },
          { category: 'health', type: 'expense' },
          { category: 'education', type: 'expense' },
        ],
      };

      await setDoc(doc(db, 'users', user.uid), encryptedUserData);
      await setDoc(doc(db, 'banks', user.uid), banks);
      await setDoc(doc(db, 'categories', user.uid), categories);

      setUser(userData);
      setNotification({ msg: 'Account created successfully!', type: 'success' });
      router.replace('/');

    } catch (error) {
      console.log(error);
      setNotification({ msg: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
    {/* Card */}
    <View style={styles.card}>
      {/* Title */}
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Create an account so you can explore all features
      </Text>

      {/* Email */}
      <TextInput placeholder="Username" style={styles.input} value={formData.username}   placeholderTextColor="#999" onChangeText={(t) => handleChange('username', t)} />
      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address"   placeholderTextColor="#999" value={formData.email} onChangeText={(t) => handleChange('email', t)} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} value={formData.password}   placeholderTextColor="#999" onChangeText={(t) => handleChange('password', t)} />

      {/* Sign Up Button */}
      <TouchableOpacity disabled={loading} style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
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