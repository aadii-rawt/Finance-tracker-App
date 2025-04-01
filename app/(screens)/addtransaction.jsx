import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
// import DateTimePicker from "@react-native-community/datetimepicker";
import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { decryptData } from "../../utils/encryption";
import { useAuth } from "../../context/AuthContext";
import DropDown from "../../components/dropDown";

const Addtransaction = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user, setNotification } = useAuth();
  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [business, setBusiness] = useState("");

  const [formData, SetFormData] = useState({
    type: "income",
    amount: "",
    accountName: "",
    category: "",
    date: new Date(),
    description: "",
    isRecurring: false,
    business: "",
  });

  const handleDataChange = (key, value) => {
    SetFormData((prev) => ({ ...prev, [key]: value }));
  };

  const fetchBanks = async () => {
    if (!user) return;
    const userRef = doc(db, "banks", decryptData(user.uid));
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) setBanks(docSnap.data().banks || []);
  };

  const fetchCategories = async () => {
    if (!user?.uid) return;
    const userCategoriesRef = doc(db, "categories", decryptData(user.uid));
    const unsubscribe = onSnapshot(userCategoriesRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = decryptData(docSnap.data());
        setCategories(data?.category);
      }
    });
    return () => unsubscribe();
  };

  useEffect(() => {
    fetchBanks();
    fetchCategories();
  }, [user?.uid]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView >
        <View style={styles.container}>
          {/* Type Switch */}
          <View style={styles.row}>
            {["expense", "income"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeButton, formData.type === t && styles.typeButtonActive]}
                onPress={() => handleDataChange("type", t)}
              >
                <Text style={formData.type === t && styles.typeButtonTextActive}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={formData.amount}
            onChangeText={(text) => handleDataChange("amount", text)}
          />

          {/* Bank */}
          <Text style={styles.label}>Bank Account</Text>
          <DropDown
            data={banks.map((b) => b?.accountName)}
            SetFormData={SetFormData}
            keyName="accountName"
            placeholder="Select your Bank"
          />

          {/* Category */}
          <Text style={styles.label}>{formData?.type === "income" ? "Source" : "Category"}</Text>
          <DropDown
            data={categories.filter(c => c.type === formData.type).map((b) => b?.category)}
            SetFormData={SetFormData}
            keyName="category"
            placeholder={formData?.type === "income" ? "Source" : "Category"}
          />

          {/* Business */}
          <Text style={styles.label}>Business</Text>
          <TextInput
            style={styles.input}
            placeholder="Select Business (optional)"
            value={business}
            onChangeText={setBusiness}
          />

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formData.date.toDateString()}</Text>
          </TouchableOpacity>
          {/* {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.date)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                const currentDate = selectedDate || formData.date;
                setShowDatePicker(false);
                handleDataChange("date", currentDate);
              }}
            />
          )} */}

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Description (optional)"
            value={formData?.description}
            onChangeText={(text) => handleDataChange("description", text)}
          />

          {/* Recurring */}
          <View style={styles.row}>
            <Text style={styles.label}>Recurring Transaction</Text>
            <Switch value={isRecurring} onValueChange={setIsRecurring} />
          </View>

          {/* Submit */}
          <TouchableOpacity onPress={() => {}} style={styles.submitButton}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Create Transaction</Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default Addtransaction;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#26897C",
    marginTop: 30,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },  
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dropdown: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#26897C",
  },
  typeButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#26897C",
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});
