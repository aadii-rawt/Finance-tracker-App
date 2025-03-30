import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import SelectDropdown from "react-native-select-dropdown";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { decryptData } from "@/utils/encryption";
import { useAuth } from "@/context/AuthContext";
import DropDown from "../../components/dropDown";

const AddIncomeExpense = () => {
  const [type, setType] = useState("income");
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [business, setBusiness] = useState("");
  // console.log(banks);
  const { user } = useAuth();

  const [formData, SetFormData] = useState({
    type: "income",
    amount: "",
    bank: "",
    category: "",
    date: new Date(),
    description: "",
    isRecurring: false,
    business: "",
  });

  const [banks, setBanks] = useState([]);

  const handleDataChange = (key, value) => {
    SetFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log(formData);
  };

  useEffect(() => {
    const fetchBanks = async () => {
      if (!user) return;
      const userRef = doc(db, "banks", decryptData(user.uid));
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setBanks(docSnap.data().banks || []);
      }
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
    fetchBanks();
    fetchCategories();
  }, [user?.uid]);

  useEffect(() => {
    console.log("banks", categories);

    const data = categories.map((b) => {
      if (b.type == formData.type) {
        return b?.category;
      }
    });
   setCategories(data)
  }, [user?.uid]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.title}>
        Add {type === "income" ? "Income" : "Expense"}
      </Text>

      {/* Type Toggle */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.type === "expense" && styles.typeButtonActive,
          ]}
          onPress={() => SetFormData((prev) => ({ ...prev, type: "expense" }))}
        >
          <Text
            style={formData.type === "expense" && styles.typeButtonTextActive}
          >
            Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            formData.type === "income" && styles.typeButtonActive,
          ]}
          onPress={() => SetFormData((prev) => ({ ...prev, type: "income" }))}
        >
          <Text
            style={formData.type === "income" && styles.typeButtonTextActive}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={formData?.amount}
        onChangeText={(text) => handleDataChange("amount", text)}
      />

      {/* Bank */}
      <Text style={styles.label}>Bank Account</Text>
      <DropDown
        data={banks.map((b) => b?.accountName)}
                SetFormData={SetFormData}
        keyName="bank"
        placeholder="Select your Bank"
      />

      {/* Category */}
      <Text style={styles.label}>
        {formData?.type === "income" ? "Source" : "Category"}
      </Text>
      <DropDown
        data={categories.map((b) => {
          if (b.type == formData.type) {
            return b?.category;
          }
        })}
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

      {/* Date Picker */}
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setShowDatePicker(false);
            setDate(currentDate);
          }}
        />
      )}

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />

      {/* Recurring */}
      <View style={styles.row}>
        <Text style={styles.label}>Recurring Transaction</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>

      {/* Submit */}
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Create Transaction
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddIncomeExpense;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
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
    marginTop: 10,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    padding: 10,
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
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});
