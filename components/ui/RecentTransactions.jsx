import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { decryptData } from "../../utils/encryption";

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
        <Text style={styles.seeAll}>See all</Text>
      </View>
      {transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{display : "flex",flexDirection : "row", gap: 10, alignItems : "center"}}>
                <View
                  style={{
                    backgroundColor: "gray",
                    width: "50px",
                    height: "50px",
                    borderRadius: 10,
                    display : "flex",
                    alignItems : 'center',
                    justifyContent: "center"
                  }}
                >
                  <Text style={{color : "white", fontSize : 24, textTransform : "capitalize"}}> {item.category[0] || "Uncategorized"}</Text>
                </View>
                <View style={styles.col}>
                  <Text style={styles.category}>
                    {item.category || "Uncategorized"}
                  </Text>
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
    marginBottom: 10,
  },
  sectionTitle: { fontWeight: "500", fontSize: 18, color: "#222222" },
  seeAll: { color: "#26897C", fontSize: 13 },
  header: { fontWeight: "bold", fontSize: 16, marginBottom: 10, color: "#333" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  col: { flex: 1 },
  category: { fontWeight: "500", fontSize: 16,textTransform: "capitalize" },
  date: { fontSize: 12, color: "#777" },
  description: { fontSize: 12, color: "#555" },
  amount: { fontWeight: "500", marginTop: 2,fontSize:16 },
  income: { color: "green" },
  expense: { color: "red" },
  noData: { textAlign: "center", color: "#777", marginTop: 20 },
});
