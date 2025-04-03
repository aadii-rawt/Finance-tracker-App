import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { decryptData } from "../../utils/encryption";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { VictoryChart, VictoryBar, VictoryAxis, VictoryGroup } from "victory-native";

const Stats = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("month");
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const docRef = doc(db, "transactions", decryptData(user.uid));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = decryptData(docSnap.data());
        const incomes = data.income || [];
        const expenses = data.expense || [];
        const all = [
          ...incomes.map((t) => ({ ...t, type: "income" })),
          ...expenses.map((t) => ({ ...t, type: "expense" })),
        ];
        setTransactions(all);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    processChartData();
  }, [transactions, filter]);

  const processChartData = () => {
    if (!transactions || transactions.length === 0) {
      setIncomeData([]);
      setExpenseData([]);
      setLabels([]);
      setTotalIncome(0);
      setTotalExpense(0);
      return;
    }

    const today = moment();
    let filtered = [];

    if (filter === "week") {
      filtered = transactions.filter((tx) => moment(tx.date).isAfter(today.clone().subtract(7, "days")));
    } else if (filter === "month") {
      filtered = transactions.filter((tx) => moment(tx.date).isSame(today, "month"));
    } else if (filter === "year") {
      filtered = transactions.filter((tx) => moment(tx.date).isSame(today, "year"));
    }

    const grouped = {};
    let incomeSum = 0;
    let expenseSum = 0;

    filtered.forEach((tx) => {
      const day = moment(tx.date).format("ddd");
      if (!grouped[day]) grouped[day] = { income: 0, expense: 0 };
      if (tx.type === "income") {
        grouped[day].income += tx.amount;
        incomeSum += tx.amount;
      } else {
        grouped[day].expense += tx.amount;
        expenseSum += tx.amount;
      }
    });

    const sortedDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const income = [];
    const expense = [];

    sortedDays.forEach((day) => {
      income.push({ x: day, y: grouped[day]?.income || 0 });
      expense.push({ x: day, y: grouped[day]?.expense || 0 });
    });

    setLabels(sortedDays);
    setIncomeData(income);
    setExpenseData(expense);
    setTotalIncome(incomeSum);
    setTotalExpense(expenseSum);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.heading}>Statistics</Text>
      <View style={styles.filterRow}>
        {["week", "month", "year"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterButton, filter === f && styles.activeFilter]}
          >
            <Text style={filter === f ? { color: "#fff" } : {}}>{f.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.card}><Text>Total Income: ₹{totalIncome}</Text></View>
        <View style={styles.card}><Text>Total Expense: ₹{totalExpense}</Text></View>
      </View>

      <VictoryChart width={Dimensions.get("window").width - 20} height={250} domainPadding={{ x: 20 }}>
        <VictoryAxis />
        <VictoryAxis dependentAxis tickFormat={(tick) => `₹${tick}`} />
        <VictoryGroup offset={15}>
          <VictoryBar data={incomeData} style={{ data: { fill: "#4CAF50" } }} />
          <VictoryBar data={expenseData} style={{ data: { fill: "#F44336" } }} />
        </VictoryGroup>
      </VictoryChart>
    </ScrollView>
  );
};

export default Stats;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  filterRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  filterButton: { padding: 10, borderRadius: 8, backgroundColor: "#ddd" },
  activeFilter: { backgroundColor: "#26897C" },
  cardsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  card: { flex: 1, backgroundColor: "#f9f9f9", padding: 10, borderRadius: 8, marginHorizontal: 5, alignItems: "center" },
});
