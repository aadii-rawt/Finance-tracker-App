import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { decryptData } from "../../utils/encryption";
import moment from "moment"; 
const alphabetColors = {
    a: "#FF5733",
    b: "#33FF57",
    c: "#3357FF",
    d: "#FF33A8",
    e: "#A833FF",
    f: "#33FFF5",
    g: "#FF8C33",
    h: "#8CFF33",
    i: "#338CFF",
    j: "#F533FF",
    k: "#FF3333",
    l: "#33FF8C",
    m: "#FFAF33",
    n: "#33A8FF",
    o: "#A8FF33",
    p: "#AF33FF",
    q: "#FF33F5",
    r: "#33FFA8",
    s: "#FFA833",
    t: "#33AFF5",
    u: "#F5FF33",
    v: "#FF33AF",
    w: "#33F5FF",
    x: "#FF5733",
    y: "#57FF33",
    z: "#5733FF"
  };
  
const TransactionHistory = () => {
  const { user } = useAuth();
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.uid) return;

      const docRef = doc(db, "transactions", decryptData(user?.uid));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = decryptData(docSnap.data());
        const incomes = data.income || [];
        const expenses = data.expense || [];

        let allTransactions = [
          ...incomes.map((tx) => ({ ...tx, type: "income" })),
          ...expenses.map((tx) => ({ ...tx, type: "expense" })),
        ];

        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const grouped = {};

        allTransactions.forEach((tx) => {
          const month = moment(tx.date).format("MMMM YYYY");

          if (!grouped[month])
            grouped[month] = { transactions: [], income: 0, expense: 0 };

          grouped[month].transactions.push(tx);

          if (tx.type === "income") grouped[month].income += tx.amount;
          if (tx.type === "expense") grouped[month].expense += tx.amount;
        });

        setGroupedData(grouped);
      }
    };

    fetchTransactions();
  }, [user?.uid]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <ScrollView >
        <View style={styles.container}>
          {Object.keys(groupedData).map((month) => (
            <View key={month} style={styles.monthBlock}>
              <View
                style={{
                  backgroundColor: "#EFEFEF",
                  padding: 5,
                  paddingHorizontal : 15,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.monthTitle}>{month}</Text>
                <View>
                  <Text style={styles.summary}>
                    Income:{" "}
                    <Text
                      style={{ color: "green", marginLeft: 5, fontWeight: 500,fontSize : 16 }}
                    >
                      + ₹{groupedData[month].income.toFixed()}{" "}
                    </Text>
                  </Text>
                  <Text style={styles.summary}>
                    Expense:{" "}
                    <Text
                      style={{ color: "red", marginLeft: 5, fontWeight: 500,fontSize : 16, marginTop : 5 }}
                    >
                      - ₹{groupedData[month].expense.toFixed()}
                    </Text>
                  </Text>
                </View>
              </View>
              {groupedData[month].transactions.map((tx, i) => (
                <View
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 5,
                    paddingHorizontal : 15
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: alphabetColors[tx?.category[0]?.toLowerCase()]  || "#C68EFD",
                      borderRadius: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{ color: "white", fontSize: 28, fontWeight: 500,textTransform: "uppercase" }}
                    >
                      {tx.category[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.category}>{tx.category}</Text>
                    <Text style={styles.date}>
                      {moment(tx.date).format("MMM D, YYYY")}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.amount,
                      tx.type === "income" ? styles.income : styles.expense,
                    ]}
                  >
                    {tx.type === "income"
                      ? `+ ₹${tx.amount}`
                      : `- ₹${tx.amount}`}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionHistory;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  monthBlock: {
    marginBottom: 5,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  monthTotals: {
    color: "#666",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    alignItems: "center",
  },
  circle: {
    width: 40,
    height: 40,
    backgroundColor: "#26897C",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  category: {
    fontSize: 16,
    fontWeight: "500",
    textTransform: "capitalize",
    color: "#222",
  },
  date: {
    fontSize: 12,
    color: "#777",
  },
  amount: {
    fontSize: 18,
    fontWeight: "600",
  },
  income: { color: "green" },
  expense: { color: "red" },
});
