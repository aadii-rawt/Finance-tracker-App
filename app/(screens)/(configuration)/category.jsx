import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Entypo, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useLocalSearchParams } from "expo-router"; // useLocalSearchParams to get route param
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { decryptData } from "../../../utils/encryption";

const CategoryScreen = () => {
  const navigation = useNavigation();
  const { type = "income" } = useLocalSearchParams(); // 👈 get 'type' from route params
  const [categories, setCategories] = useState([]);
  const { user, setNotification } = useAuth();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: type === "expense" ? "Expense Category" : "Income Category",
    });
  }, [navigation, type]);

  const fetchCategories = () => {
    if (!user?.uid) return;

    const userCategoriesRef = doc(db, "categories", decryptData(user.uid));

    const unsubscribe = onSnapshot(userCategoriesRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = decryptData(docSnap.data());
        const filtered = (data.category || []).filter(
          (item) => item.type === type
        );
        setCategories(filtered);
      } else {
        console.log("No category data found");
      }
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchCategories();
    return () => unsubscribe && unsubscribe();
  }, [user, type]);

  const handleDelete = async (categoryToDelete) => {
    if (!user?.uid) return;
    console.log(categoryToDelete);

    try {
      // Reference to the user's transaction document
      const transactionRef = doc(db, "transactions", decryptData(user.uid));
      const transactionSnap = await getDoc(transactionRef);

      if (transactionSnap.exists()) {
        const data = transactionSnap.data();
        const allTransactions = [
          ...(data.income || []),
          ...(data.expense || []),
        ];
        // Check if any transaction has the category to be deleted
        const isCategoryUsed = allTransactions.some(
          (transaction) =>
            transaction.category === categoryToDelete?.category &&
            transaction.type === categoryToDelete?.type
        );

        if (isCategoryUsed) {
          setNotification({
            msg: "This category cannot be deleted as they are associated with some transactions..",
            type: "error",
          });
          return;
        }
      }

      // Reference to the user's category document
      const userCategoriesRef = doc(db, "categories",decryptData(user.uid));
      const updatedCategories = categories.filter(
        (cat) => cat !== categoryToDelete
      );

      // Update Firestore with the new category list
      await updateDoc(userCategoriesRef, { category: updatedCategories });

      console.log("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => console.log("Add Category")}
        >
          <Ionicons name="add" size={28} color="white" />
          <Text style={{ color: "white", fontSize: 18 }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item?.category}</Text>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.rightIcons}>
              <MaterialIcons name="delete-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 30 }}>
            No {type} categories found.
          </Text>
        }
      />
    </View>
  );
};

export default CategoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  header: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  addButton: {
    backgroundColor: "red",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    textTransform: "capitalize",
  },
  rightIcons: {
    flexDirection: "row",
    gap: 15,
  },
});
