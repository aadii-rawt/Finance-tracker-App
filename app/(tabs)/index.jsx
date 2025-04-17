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
import { db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { decryptData } from "../../utils/encryption";
import RecentTransactions from "../../components/ui/RecentTransactions";
import AppSafeArea from "../../components/AppSafeArea";

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { PermissionsAndroid } from 'react-native';

import SmsListener from 'react-native-android-sms-listener';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const parseSMS = (message) => {
   console.log("Parsing message:", message);
  const creditMatch = message.match(/(?:₹|Rs\.?)\s?(\d+(?:\.\d+)?).*(credited)/i);
  const debitMatch = message.match(/(?:₹|Rs\.?)\s?(\d+(?:\.\d+)?).*(debited)/i);

  if (creditMatch) {
    console.log("✅ Credit matched:", creditMatch[1]);
    return { type: 'income', amount: creditMatch[1] };
  }

  if (debitMatch) {
    console.log("✅ Debit matched:", debitMatch[1]);
    return { type: 'expense', amount: debitMatch[1] };
  }

  console.log("❌ Regex did not match.");
  return null;
};


export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);


useEffect(() => {
  const subscription = SmsListener.addListener(message => {
    console.log("📩 Real-time incoming SMS:", message.body);
    const parsed = parseSMS(message.body);
    if (parsed) {
      sendLocalNotification(parsed.type, parsed.amount);
    }
  });

  return () => subscription.remove(); // cleanup
}, []);


  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // useEffect(() => {
  //   const requestAndReadSMS = async () => {
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.READ_SMS,
  //         {
  //           title: 'Read SMS Permission',
  //           message: 'App needs access to your SMS to detect bank transactions',
  //           buttonPositive: 'OK',
  //         }
  //       );

  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         const filter = {
  //           box: 'inbox',
  //           maxCount: 5, // only fetch latest 5 messages
  //         };

  //         SmsAndroid.list(

  //           JSON.stringify(filter),
  //           (fail) => {
  //             console.log('Failed with this error: ' + fail);
  //           },
  //           async (count, smsList) => {
  //             const messages = JSON.parse(smsList);
  //             console.log("Fetched SMS messages:", messages);

  //             for (let msg of messages) {
  //               const parsed = parseSMS(msg.body);
  //               if (parsed) {
  //                 await sendLocalNotification(parsed.type, parsed.amount);
  //                 break; // stop after first matched message
  //               }
  //             }
  //           }
  //         );
  //       } else {
  //         console.log('SMS permission denied');
  //       }
  //     } catch (err) {
  //       console.warn(err);
  //     }
  //   };

  //   requestAndReadSMS();
  // }, []);



  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  const sendLocalNotification = async (type, amount) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${type === 'income' ? 'Income' : 'Expense'} Detected`,
        body: `₹${amount} ${type === 'income' ? 'credited' : 'debited'} - Add to tracker?`,
        data: { amount, type }
      },
      trigger: null, // send immediately
    });
  };

  // useEffect(() => {
  //   sendLocalNotification('income', 500)
  // }, [])

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
