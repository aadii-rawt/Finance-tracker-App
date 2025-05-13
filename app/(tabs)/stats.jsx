import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { decryptData } from "../../utils/encryption";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 30;

const Stats = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("month");
  const [chartLabels, setChartLabels] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
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
      setChartLabels(["No Data"]);
      setIncomeData([0]);
      setExpenseData([0]);
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
      const label = moment(tx.date).format("DD MMM");
      if (!grouped[label]) grouped[label] = { income: 0, expense: 0 };
      if (tx.type === "income") {
        grouped[label].income += tx.amount;
        incomeSum += tx.amount;
      } else {
        grouped[label].expense += tx.amount;
        expenseSum += tx.amount;
      }
    });

    const labels = Object.keys(grouped);
    const income = labels.map((label) => grouped[label].income);
    const expense = labels.map((label) => grouped[label].expense);

    setChartLabels(labels);
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Income</Text>
          <Text style={styles.cardValue}>₹{totalIncome}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Expense</Text>
          <Text style={styles.cardValue}>₹{totalExpense}</Text>
        </View>
      </View>

      {/* Custom combined dataset chart */}
      <BarChart
        data={{
          labels: chartLabels,
          datasets: [
            {
              data: incomeData,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green
            },
            {
              data: expenseData,
              color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, // Red
            },
          ],
          legend: ["Income", "Expense"],
        }}
        width={screenWidth}
        height={260}
        yAxisLabel="₹"
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: () => "#444",
          propsForBackgroundLines: {
            stroke: "#eee",
          },
          barPercentage: 0.5,
        }}
        style={{ borderRadius: 16, marginTop: 15 }}
        withInnerLines={false}
        fromZero
        showBarTops={false}
      />
    </ScrollView>
  );
};

export default Stats;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ddd",
    minWidth: 90,
    alignItems: "center",
  },
  activeFilter: { backgroundColor: "#26897C" },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
});
