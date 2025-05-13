import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { decryptData } from "../../utils/encryption";
import { useAuth } from "../../context/AuthContext";
import DropDown from "../../components/dropDown";
import uuid from 'react-native-uuid';
import { useNavigation } from "expo-router";

const Addtransaction = () => {

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Transaction", 
    });
  }, [navigation]);

  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [date, setDate] = useState(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [endDate, setEndDate] = useState("");
  const { user, setNotification } = useAuth();

  const [formData, SetFormData] = useState({
    type: "income",
    amount: "",
    bank: "",
    category: "",
    date: new Date(),
    description: "",
    isRecurring: false,
    recurringType: "",
    business: "",
  });

  const handleDataChange = (key, value) => {
    SetFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {

    if (formData.amount <= 0) {
      return setNotification({ msg: "Please Enter a valid amount", type: "error" });
    }
  
    if (!formData.type || !formData.amount || !formData.category || !formData.accountName) {
      return setNotification({ msg: "Please fill all required fields!", type: "error" });
    }
  
    try {
      const fieldName = formData.type === "income" ? "income" : "expense";
      const docRef = doc(db, "transactions", decryptData(user?.uid));
  
      if (formData.accountName) {
        const bank = banks.find(bank => bank.accountName === formData.accountName);
        if (formData.date >= bank.createDate) {
          await updateBankBalance(bank.accountName, formData.amount, fieldName);
        }
      }
  
      const transactionId = uuid.v4();
  
      // Build transactionData dynamically
      const transactionData = {
        transactionId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formatDate(formData.date),
        description: formData.description,
        accountName: formData.accountName,
        createdAt: Date.now(),
        businessName: formData.business,
        isRecurring : isRecurring,
      };
  
      // Store in transactions
      await setDoc(
        docRef,
        {
          [fieldName]: arrayUnion(transactionData),
        },
        { merge: true }
      );
  
      // Store in business_transactions
      const userRef = doc(db, "business_transactions", decryptData(user.uid));
  
      await setDoc(
        userRef,
        {
          transactions: arrayUnion({
            ...transactionData,
            date: formData.date,
          }),
        },
        { merge: true }
      );
  
      // Store in recurring_transactions if applicable
      if (isRecurring) {
        const recurringDocRef = doc(db, "recurring_transactions", decryptData(user.uid));
        const recurringTransaction = {
          ...transactionData,
          recurringTransactionId: uuid.v4(),
          startDate: formData.date,
          status: "active",
          recurringType : formData.recurringType,
          endDate: endDate ? new Date(endDate).getTime() : null,
          nextExecution: calculateNextExecution(formData.date, formData.recurringType),
        };
  
        await setDoc(
          recurringDocRef,
          {
            recurringTransactions: arrayUnion(recurringTransaction),
          },
          { merge: true }
        );
      }
  
      setNotification({ msg: "Transaction Added", type: "success" });
  
      // Reset Form
      SetFormData({
        type: "expense",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        isRecurring: false,
        business: "",
        accountName: "",
      });
      setIsRecurring(false);
      setEndDate("");
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      // setIsSubmitting(false);
    }
  };
  
  const updateBankBalance = async (bankId, amount, fieldName) => {

    const userRef = doc(db, "banks", decryptData(user.uid));
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      let updatedBanks = docSnap.data().banks || [];
      updatedBanks = updatedBanks.map((bank) =>
        bank.accountName === bankId ? { ...bank, initialBalance: fieldName == "income" ? bank.initialBalance + parseFloat(amount) : bank.initialBalance - parseFloat(amount) } : bank
      );
      await updateDoc(userRef, { banks: updatedBanks });
      fetchBanks(); // Refresh bank list after update
    }
  };

  const calculateNextExecution = (startDate, recurringType) => {
    let nextDate = new Date(startDate);
    switch (recurringType) {
      case "daily": nextDate.setDate(nextDate.getDate() + 1); break;
      case "weekly": nextDate.setDate(nextDate.getDate() + 7); break;
      case "monthly": nextDate.setMonth(nextDate.getMonth() + 1); break;
      case "quarterly": nextDate.setMonth(nextDate.getMonth() + 3); break;
      case "yearly": nextDate.setFullYear(nextDate?.getFullYear() + 1); break;
    }
    return nextDate.getTime();
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
      if (docSnap.exists()) setCategories(decryptData(docSnap.data())?.category);
    });
    return () => unsubscribe();
  };

  const formatDate = (date) => {
    const d = new Date(date); // ensure it's a Date object
    const year = d.getFullYear();
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const day = `0${d.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
};

  useEffect(() => {
    fetchBanks();
    fetchCategories();
  }, [user?.uid]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.typeButton, formData.type === "expense" && styles.typeButtonActive]} onPress={() => handleDataChange("type", "expense")}> <Text style={formData.type === "expense" && styles.typeButtonTextActive}>Expense</Text> </TouchableOpacity>
        <TouchableOpacity style={[styles.typeButton, formData.type === "income" && styles.typeButtonActive]} onPress={() => handleDataChange("type", "income")}> <Text style={formData.type === "income" && styles.typeButtonTextActive}>Income</Text> </TouchableOpacity>
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput style={styles.input} placeholder="Enter amount" keyboardType="numeric" value={formData.amount} onChangeText={(text) => handleDataChange("amount", text)} />

      <Text style={styles.label}>Bank Account</Text>
      <DropDown data={banks.map((b) => b.accountName)} SetFormData={SetFormData} keyName="accountName" placeholder="Select your Bank" />

      <Text style={styles.label}>{formData.type === "income" ? "Source" : "Category"}</Text>
      <DropDown data={categories.filter(c => c.type === formData.type).map(c => c.category)} SetFormData={SetFormData} keyName="category" placeholder={formData.type === "income" ? "Source" : "Category"} />

      <Text style={styles.label}>Business</Text>
      <TextInput style={styles.input} placeholder="Business (optional)" value={formData.business} onChangeText={(text) => handleDataChange("business", text)} />

      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={formData.date} onChangeText={(text) => handleDataChange("date", text)} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} placeholder="Description (optional)" value={formData.description} onChangeText={(text) => handleDataChange("description", text)} />

      <View style={styles.row}>
        <Text style={styles.label}>Recurring Transaction</Text>
        <Switch value={isRecurring} onValueChange={(val) => { setIsRecurring(val); handleDataChange("isRecurring", val); }} />
      </View>

      {isRecurring && (
        <>
          <Text style={styles.label}>Recurring Type</Text>
          <DropDown data={["daily", "weekly", "monthly", "quarterly", "yearly"]} SetFormData={SetFormData} keyName="recurringType" placeholder="Select Recurring Type" />

          <Text style={styles.label}>End Date (optional)</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
        </>
      )}

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Create Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Addtransaction;


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
    borderWidth: 1,
    borderColor: "#ccc",
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
    padding: 13,
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
