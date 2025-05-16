import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"; // useLocalSearchParams to get route param
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase";
import { decryptData } from "../../../utils/encryption";

const CategoryScreen = () => {
  const navigation = useNavigation();
  const { type = "income" } = useLocalSearchParams(); // 👈 get 'type' from route params
  const [categories, setCategories] = useState([]);
  const { user, setNotification } = useAuth();
  const router = useRouter()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: type === "expense" ? "Expense Category" : "Income Category",
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => router.push(`newCategory?type=${type}`)} // 👈 Navigate with param
        >
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router, type]);


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

    try {
      // 1. Check if this category is used in any transaction
      const transactionRef = doc(db, "transactions", user.uid);
      const transactionSnap = await getDoc(transactionRef);

      if (transactionSnap.exists()) {
        const data = transactionSnap.data();
        const allTransactions = [
          ...(data.income || []),
          ...(data.expense || []),
        ];

        const isCategoryUsed = allTransactions.some(
          (transaction) =>
            transaction.category.toLowerCase() === categoryToDelete.category.toLowerCase() &&
            transaction.type === categoryToDelete.type
        );

        if (isCategoryUsed) {
          setNotification({
            msg: "This category cannot be deleted as it is associated with some transactions.",
            type: "error",
          });
          return;
        }
      }

      // 2. Get the full category list from Firestore
      const categoryRef = doc(db, "categories", user.uid);
      const categorySnap = await getDoc(categoryRef);

      if (!categorySnap.exists()) {
        console.warn("No category data found.");
        return;
      }

      const data = categorySnap.data();
      const allCategories = data.category || [];

      // 3. Remove the specific category (match by name + type)
      const updatedCategories = allCategories.filter(
        (cat) =>
          !(
            cat.category.toLowerCase() === categoryToDelete.category.toLowerCase() &&
            cat.type === categoryToDelete.type
          )
      );

      // 4. Update Firestore with the new category list
      await updateDoc(categoryRef, { category: updatedCategories });

      console.log("Category deleted successfully.");
      setNotification({
        msg: "Category deleted successfully.",
        type: "success",
      });

    } catch (error) {
      console.error("Error deleting category:", error);
      setNotification({
        msg: "Failed to delete category.",
        type: "error",
      });
    }
  };


  return (
    <View style={styles.container}>

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
