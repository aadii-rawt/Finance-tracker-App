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
import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
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
  const { user , setNotification} = useAuth();

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

  const handleSubmit = async () => {
    console.log(formData);
    if (formData.amount <= 0) {
      return setNotification({ msg: "Please Enter a valid amount", type: "error" })
    }
    if (!formData.type || !formData.amount || !formData.category || !formData.accountName) {
      return setNotification({ msg: "Please fill all required fields!", type: "error" })
    }

    try {
      // setIsSubmiting(true)
      // Decide which field to update based on the type
      const fieldName = formData.type === "income" ? "income" : "expense";
      const docRef = doc(db, "transactions", decryptData(user.uid));

      // Store the transaction with the updated type
      const encryptedData = formData
      if (encryptedData.accountName) {
        const bank = banks.find((bank) => bank.accountName === encryptedData.accountName);
        if (formData.date >= bank.createDate) {
          const bankId = banks.find((bank) => bank.accountName === encryptedData.accountName);
          await updateBankBalance(bankId.accountName, encryptedData.amount, fieldName);
        }
      }

      console.log(encryptedData);

      const transactionId = crypto.randomUUID();
      const transactionData = {
        transactionId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formatDate(formData.date),
        description: formData.description,
        accountName: formData.accountName,
        isRecurring: formData.isRecurring || false,
        createdAt: Date.now(),
        businessName: formData.business,
      };

      // 🔹 Store transaction in "transactions" collection
      await setDoc(
        docRef,
        {
          [fieldName]: arrayUnion({
            ...transactionData
          }),
        },
        { merge: true }
      );

      
      const userRef = doc(db, "business_transactions", decryptData(user.uid));
      const transactionObj = {
        transactionId: transactionId,
        type: formData.type === "income" ? "income" : "expense",
        amount: isNaN(parseFloat(formData.amount)) ? 0 : parseFloat(formData.amount), // Ensures valid number
        date: formData.date, // Ensure 'date' is in correct format (YYYY-MM-DD)
        description: formData.description,
        businessName: formData.business,
        createdAt: Date.now(), // Firestore timestamp instead of Date.now()
        accountName: formData.accountName,
        category: formData.category,
      };

      console.log(transactionObj);
      try {
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          await updateDoc(userRef, {
            transactions: arrayUnion(transactionObj), // Works unless transactionId already exists
          });
        } else {
          await setDoc(userRef, {
            transactions: [transactionObj], // Initializes with a new array
          });
        }
      } catch (error) {
        console.error("Error adding transaction:", error);
      }
      
      if (formData.isRecurring) {
        const recurringDocRef = doc(db, "recurring_transactions",  decryptData(user.uid));
        const recurringTransaction = {
          recurringTransactionId: crypto.randomUUID(),
          ...transactionData,
          startDate: formData.date,
          endDate: formData.endDate || null,
          recurringType: formData.recurringType,
          status: "active", // Can be "active", "paused", "cancelled"
          nextExecution: calculateNextExecution(formData.date, formData.recurringType),
        };

        await setDoc(recurringDocRef, {
          recurringTransactions: arrayUnion(recurringTransaction),
        }, { merge: true });
      }

      console.log("Transaction saved successfully!");
      // Optionally reset the form
      setNotification({ msg: "Transaction Added", type: "success" })

      SetFormData({
        type: "expense",
        amount: 0,
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        business: "",
      });
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      // setIsSubmiting(false)
    }

  };

  const updateBankBalance = async (bankId, amount, fieldName) => {
    // if (!user?.uid) return;
    const userRef = doc(db, "banks",  decryptData(user.uid));
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
      case "2minutes": // Testing purpose
        nextDate.setMinutes(nextDate.getMinutes() + 2);
        break;
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "quarterly":
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate.getTime(); // Convert to timestamp
  };

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

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Ensures 2 digits
    const day = (`0${date.getDate()}`).slice(-2); // Ensures 2 digits
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchBanks();
    fetchCategories();
  }, [user?.uid]);

  // useEffect(() => {
  //   console.log("banks", categories);

  //   const data = categories.map((b) => {
  //     if (b.type == formData.type) {
  //       return b?.category;
  //     }
  //   });
  //  setCategories(data)
  // }, [user?.uid]);

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
        keyName="accountName"
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
          value={formatDate.date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setShowDatePicker(false);
            SetFormData((prev) =>  ({...prev, date: currentDate}))
          }}
        />
      )}

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
