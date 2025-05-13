import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext"
import { db } from ".././firebase";
import { doc, getDoc } from "firebase/firestore";
import { decryptData } from "../utils/encryption";
import { Link } from "expo-router";

const alphabetColors = {
  a: "#E53935", // Dark Red
  b: "#D81B60", // Dark Pink
  c: "#8E24AA", // Dark Purple
  d: "#5E35B1", // Dark Deep Purple
  e: "#3949AB", // Dark Indigo
  f: "#1E88E5", // Dark Blue
  g: "#039BE5", // Dark Light Blue
  h: "#00ACC1", // Dark Cyan
  i: "#00897B", // Dark Teal
  j: "#43A047", // Dark Green
  k: "#7CB342", // Dark Light Green
  l: "#C0CA33", // Dark Lime
  m: "#FDD835", // Dark Yellow
  n: "#FFB300", // Dark Amber
  o: "#FB8C00", // Dark Orange
  p: "#F4511E", // Dark Deep Orange
  q: "#6D4C41", // Dark Brown
  r: "#757575", // Dark Grey
  s: "#546E7A", // Dark Blue Grey
  t: "#D32F2F", // Darker Red
  u: "#C2185B", // Darker Pink
  v: "#7B1FA2", // Darker Purple
  w: "#512DA8", // Darker Deep Purple
  x: "#303F9F", // Darker Indigo
  y: "#1976D2", // Darker Blue
  z: "#0288D1", // Darker Light Blue
};

const RecentTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!user?.uid) return;

        const docRef = doc(db, "transactions", decryptData(user?.uid));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = decryptData(docSnap.data());

          const incomes = data.income || [];
          const expenses = data.expense || [];

          let combinedTransactions = [
            ...incomes.map((tx) => ({ ...tx, type: "income" })),
            ...expenses.map((tx) => ({ ...tx, type: "expense" })),
          ];

          // Sort descending by date
          combinedTransactions.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          // Only get recent 5
          const recentFive = combinedTransactions.slice(0, 5);

          setTransactions(recentFive);
        } else {
          console.log("No transaction data found for this user.");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    if (user?.uid) {
      fetchTransactions();
    }
  }, [user?.uid]);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transactions History</Text>
        <Link href="/transactionhistory" style={styles.seeAll}>
          See all
        </Link>
      </View>
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                {/* <View
                  style={{
                    backgroundColor: "gray",
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 24,
                      textTransform: "capitalize",
                    }}
                  >
                    {" "}
                    {item.category[0] || "Uncategorized"}
                  </Text>
                </View> */}
                <View
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor:
                      alphabetColors[item?.category[0]?.toLowerCase()] ||
                      "#C68EFD",
                    borderRadius: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 28,
                      fontWeight: 500,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.category[0]}
                  </Text>
                </View>
                <View>
                  <Text style={styles.amount}>{item.category}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
              </View>
              <View>
                <Text
                  style={[
                    styles.amount,
                    item.type === "income" ? styles.income : styles.expense,
                  ]}
                >
                  {item.type === "income"
                    ? `+ ₹${item.amount}`
                    : `- ₹${item.amount}`}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noData}>No transactions found</Text>
      )}
    </View>
  );
};

export default RecentTransactions;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    // backgroundColor: ",
    borderRadius: 12,
    marginVertical: 10,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: { fontWeight: "500", fontSize: 20, color: "#222222" },
  seeAll: { color: "#26897C", fontSize: 16 },
  header: { fontWeight: "bold", fontSize: 16, marginBottom: 10, color: "#333" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  col: { flex: 1 },
  category: {
    fontWeight: 500,
    color: "black",
    fontSize: 16,
    textTransform: "capitalize",
  },
  date: { fontSize: 12, color: "#777" },
  description: { fontSize: 12, color: "#555" },
  amount: { fontWeight: "500", marginTop: 2, fontSize: 16 },
  income: { color: "green" },
  expense: { color: "red" },
  noData: { textAlign: "center", color: "#777", marginTop: 20 },
});
