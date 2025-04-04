import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useNavigation, useLocalSearchParams } from "expo-router"; // useLocalSearchParams to get route param
import { useAuth } from "../../../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { decryptData } from "../../../utils/encryption";

const CategoryScreen = () => {
  const navigation = useNavigation();
  const { type = "income" } = useLocalSearchParams(); // 👈 get 'type' from route params
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();

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
            <TouchableOpacity>
              <Entypo name="minus" size={20} color="red" />
            </TouchableOpacity>
            <Text style={styles.itemText}>{item?.category}</Text>
            <View style={styles.rightIcons}>
              <Ionicons name="pencil-outline" size={20} color="#666" />
              <Ionicons name="reorder-three" size={24} color="#999" />
            </View>
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
