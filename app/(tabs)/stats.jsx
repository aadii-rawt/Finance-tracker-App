import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { decryptData } from "../../utils/encryption";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";

const Stats = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("month"); // week, month, year
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

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
        console.log(all);
        
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
        setChartData({ labels: ['No Data'], datasets: [{ data: [0] }] });
        return;
    }

    let filtered = [];
    const today = moment();

    if (filter === 'week') {
        filtered = transactions.filter(tx => moment(tx.date).isAfter(today.clone().subtract(7, 'days')));
    } else if (filter === 'month') {
        filtered = transactions.filter(tx => moment(tx.date).isSame(today, 'month'));
    } else if (filter === 'year') {
        filtered = transactions.filter(tx => moment(tx.date).isSame(today, 'year'));
    }

    if (filtered.length === 0) {
        setChartData({ labels: ['No Data'], datasets: [{ data: [0] }] });
        return;
    }

    const grouped = {};

    filtered.forEach(tx => {
        const date = moment(tx.date).format('DD MMM');
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += tx.type === 'income' ? tx.amount : -tx.amount;
    });

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    setChartData({
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [{ data: data.length > 0 ? data : [0] }]
    });
};




  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.heading}>Transaction Analytics</Text>
      <View style={styles.filterRow}>
        {["week", "month", "year"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterButton, filter === f && styles.activeFilter]}
          >
            <Text style={filter === f && { color: "#fff" }}>
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <LineChart
    data={{
      labels: chartData.labels,
      datasets: chartData.datasets,   // ✅ Use datasets directly
    }}
    width={Dimensions.get("window").width - 30}
    height={220}
    // formatYLabel={(value) => `₹${value}`}
    formatYLabel={(value) => `${parseFloat(value)}`}

    chartConfig={{
      backgroundColor: "#ffffff",
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 128, 128, ${opacity})`,
      style: { borderRadius: 16 },
    }}
    style={{ marginVertical: 20, borderRadius: 16 }}
/>
    </ScrollView>
  );
};

export default Stats;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 15 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  filterButton: { padding: 10, borderRadius: 8, backgroundColor: "#ddd" },
  activeFilter: { backgroundColor: "#26897C" },
});
