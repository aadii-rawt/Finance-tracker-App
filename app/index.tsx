import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { decryptData } from "../utils/encryption";
const transactions = [
  { id: "1", title: "Upwork", date: "Today", amount: 850, type: "income" },
  {
    id: "2",
    title: "Transfer",
    date: "Yesterday",
    amount: -85,
    type: "expense",
  },
  {
    id: "3",
    title: "Paypal",
    date: "Jan 30, 2022",
    amount: 1406,
    type: "income",
  },
  {
    id: "4",
    title: "Youtube",
    date: "Jan 16, 2022",
    amount: -11.99,
    type: "expense",
  },
];

const sendAgain = [
  { id: "1", name: "A" },
  { id: "2", name: "B" },
  { id: "3", name: "C" },
  { id: "4", name: "D" },
];

export default function Home() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  console.log(user);

  useEffect(() => {
    setUser(decryptData(user));
  }, []);
  // console.log(decryptData(user));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good afternoon,</Text>
          <Text style={styles.name}>{user?.username}</Text>
          <TouchableOpacity
            style={styles.bell}
            onPress={() => router.push("/login")}
          >
            <Text>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.totalText}>Total Balance</Text>
          <Text style={styles.amount}>$2,548.00</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.label}>Income</Text>
              <Text style={[styles.income, styles.balanceAmount]}>
                $1,840.00
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Expenses</Text>
              <Text style={[styles.expense, styles.balanceAmount]}>
                $284.00
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions History</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <View style={styles.iconPlaceholder}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {item.title[0]}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionDate}>{item.date}</Text>
              </View>
              <Text
                style={{
                  color: item.amount > 0 ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {item.amount > 0
                  ? `+ $${item.amount}`
                  : `- $${Math.abs(item.amount)}`}
              </Text>
            </View>
          )}
        />

        {/* Send Again */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Again</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sendAgain.map((user) => (
            <View key={user.id} style={styles.avatarPlaceholder}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {user.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Floating Button */}
        <TouchableOpacity style={styles.floatingButton}>
          <Text style={{ fontSize: 24, color: "#fff" }}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 10,
  },
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 20 },
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
  totalText: { color: "#fff" },
  amount: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    marginVertical: 5,
  },
  balanceRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: "#ccc", fontSize: 12 },
  balanceAmount: { fontWeight: "bold", marginTop: 5 },
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
