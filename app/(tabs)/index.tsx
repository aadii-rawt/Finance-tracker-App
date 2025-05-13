import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { decryptData } from "../../utils/encryption";
import AppSafeArea from "../../components/AppSafeArea";
import RecentTransactions from "../../components/RecentTransactions";



export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const docRef = doc(db, "transactions", decryptData(user.uid));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = decryptData(docSnap.data());
          const incomeList = data.income || [];
          const expenseList = data.expense || [];

          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          // Filter transactions inside current month
          const filteredIncome = incomeList.filter(
            (t) => new Date(t.date) >= startOfMonth
          );
          const filteredExpense = expenseList.filter(
            (t) => new Date(t.date) >= startOfMonth
          );

          const totalIncomeCalc = filteredIncome.reduce(
            (acc, t) => acc + t.amount,
            0
          );
          const totalExpenseCalc = filteredExpense.reduce(
            (acc, t) => acc + t.amount,
            0
          );

          setTotalIncome(totalIncomeCalc);
          setTotalExpense(totalExpenseCalc);
          setBalance(totalIncomeCalc - totalExpenseCalc);

          // Optional: if you want to display only filtered transactions
          setTransactions(
            [
              ...filteredIncome.map((t) => ({ ...t, type: "income" })),
              ...filteredExpense.map((t) => ({ ...t, type: "expense" })),
            ].sort((a, b) => new Date(b.date) - new Date(a.date))
          );
        }
      } catch (error) {
        console.log("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [user]);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/welcome");
    }
  }, [user, isReady]);

  return (
    <AppSafeArea>
      <ScrollView style={{ backgroundColor: "white" }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {/* <Text style={styles.greeting}>Good afternoon,</Text> */}
            {/* <Text style={styles.name}>{decryptData(user?.username)}</Text> */}
            <TouchableOpacity onPress={() => router.push("/welcome")}>
              <Text style={styles.bell}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.totalText}>Total Balance</Text>
            <Text style={styles.amount}>₹ {balance.toFixed()}</Text>
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.label}>Income</Text>
                <Text style={[styles.income, styles.balanceAmount]}>
                  ₹ {totalIncome.toFixed()}
                </Text>
              </View>
              <View>
                <Text style={styles.label}>Expenses</Text>
                <Text style={[styles.expense, styles.balanceAmount]}>
                  ₹ {totalExpense.toFixed()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: "white" }}>
          <RecentTransactions />
        </View>
      </ScrollView>
      <View style={{ position: "absolute", bottom: 40, right: 20 }}>
        <TouchableOpacity
          onPress={() => router.push("/addtransaction")}
          style={{
            backgroundColor: "#26897C",
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            elevation: 5, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 30 }}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </AppSafeArea>
  );
}

const styles = StyleSheet.create({
  // safeArea: {
  //   flex: 1,
  //   paddingTop: 10,
  // },
  container: { flex: 1, backgroundColor: "white", padding: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { color: "#555" },
  name: { fontSize: 18, fontWeight: "bold" },
  bell: { padding: 8 },
  balanceCard: {
    backgroundColor: "#26897C",
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
  },
  totalText: { color: "#fff", fontSize: 16, },
  amount: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "bold",
    marginVertical: 5,
  },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, },
  label: { color: "#ccc", fontSize: 16 },
  balanceAmount: { fontWeight: "bold", marginTop: 5, fontSize: 24 },
  income: { color: "#00e676" },
  expense: { color: "#ff1744" },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 5,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16 },
  seeAll: { color: "#26897C", fontSize: 12 },
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#26897C",
    justifyContent: "center",
    alignItems: "center",
  },
  transactionTitle: { fontWeight: "bold", fontSize: 14 },
  transactionDate: { fontSize: 12, color: "#777" },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#26897C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 5,
  },
  floatingButton: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#26897C",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
