import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { AntDesign, FontAwesome6, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';


import TransactionShimmer from '@/components/ui/ShimmerTransaction';
import { alphabetColors } from "../../utils/utils";

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [month, setMonth] = useState(moment());
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  const { user , setNotification} = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);

      const docRef = doc(db, 'transactions', user?.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { income = [], expense = [] } = docSnap.data();
        const all = [...income, ...expense];

        const filtered = all.filter(tx => moment(tx.date).isSame(month, 'month'));
        const sorted = filtered.sort((a, b) => moment(b.date).diff(moment(a.date)));

        setAllTransactions(sorted);
      } else {
        setAllTransactions([]);
      }
      setIsLoading(false);
    };

    fetchTransactions();
  }, [month]);

  const handleMonthChange = direction => {
    setMonth(prev => (direction === 'prev' ? moment(prev).subtract(1, 'month') : moment(prev).add(1, 'month')));
    setSelectedDate(null); // Reset selected day filter on month change
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(moment(date).format('YYYY-MM-DD'));
  };

  const filteredGrouped = allTransactions.filter(tx => {
      const matchesSearch =
        tx.category.toLowerCase().includes(searchText.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchText.toLowerCase());

      const matchesDate = selectedDate
        ? moment(tx.date).format('YYYY-MM-DD') === selectedDate
        : true;

      return matchesSearch && matchesDate;
    })
    .reduce((acc, tx) => {
      const day = moment(tx.date).format('DD');
      const dayName = moment(tx.date).format('dddd');
      const time = moment.unix(tx.createdAt).format('h:mm a');

      const item = {
        category: tx.category,
        amount: tx.amount,
        time,
        date: tx.date,
        accountName: tx.accountName,
        description: tx.description,
        type: tx.type,
        transactionId : tx.transactionId
      };

      const groupIndex = acc.findIndex(g => g.date === day);
      if (groupIndex !== -1) {
        acc[groupIndex].items.push(item);
      } else {
        acc.push({ date: day, day: dayName, items: [item] });
      }
      return acc;
    }, [])
    .sort((a, b) => parseInt(b.date) - parseInt(a.date));



  const handleDelete = async (transactionToDelete, deleteType="single") => {
    console.log(transactionToDelete);

    if (!user) return;

    try {
      const transactionRef = doc(db,"transactions", user.uid);
      const docSnap = await getDoc(transactionRef);

      if (!docSnap.exists()) return;

      const data = docSnap.data();
      let newIncomeArray = [...(data.income || [])];
      let newExpenseArray = [...(data.expense || [])];

      // Restricted categories that cannot be deleted
      const restrictedCategories = [
        "Loan EMI",
        "Flat Loan Payment",
        "Flat Loan Receipt",
        "Flat Loan Interest Received",
        "Flat Loan Interest Payment",
      ];

      // Helper function to update bank balance on delete
      const updateBankBalanceOnDelete = async (accountName, amount, type) => {
        if (!accountName) return;
        const bankRef = doc(db, "banks", user.uid);
        const bankSnap = await getDoc(bankRef);

        if (!bankSnap.exists()) return;

        const bankData = bankSnap.data();
        const updatedBanks = bankData.banks.map((bank) => {
          if (bank.accountName === accountName) {
            return {
              ...bank,
              initialBalance:
                type === "income"
                  ? bank.initialBalance - parseFloat(amount)
                  : bank.initialBalance + parseFloat(amount),
            };
          }
          return bank;
        });

        await updateDoc(bankRef, { banks: updatedBanks });
      };

      if (true) {
        // Prevent deletion if it's in the restricted categories
        if (restrictedCategories.includes(transactionToDelete.category)) {
          setNotification({
            msg: "This transaction cannot be deleted.",
            type: "error",
          });
          return;
        }

        // 🔁 Update bank balance before deleting
        await updateBankBalanceOnDelete(
          transactionToDelete.accountName,
          transactionToDelete.amount,
          transactionToDelete.type
        );

        // Delete single transaction
        if (transactionToDelete.type === "income") {
          newIncomeArray = newIncomeArray.filter(
            (txn) => txn.transactionId !== transactionToDelete.transactionId
          );
        } else {
          newExpenseArray = newExpenseArray.filter(
            (txn) => txn.transactionId !== transactionToDelete.transactionId
          );
        }
      } 
      // Update Firestore with new filtered arrays
      await updateDoc(transactionRef, {
        income: newIncomeArray,
        expense: newExpenseArray,
      });

      setNotification({
        msg: "Transaction(s) deleted successfully",
        type: "success",
      });
    } catch (error) {
      setNotification({ msg: "Oops something went wrong.", type: "error" });
      console.error("Error deleting transactions:", error);
    } finally {
      setModalVisible(false)
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={24} color="black" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.monthNav}>
        <Text style={styles.month}>{month.format('MMMM YYYY')}</Text>

        <View style={{ display: "flex", gap: 20, flexDirection: "row" }}>
          <TouchableOpacity onPress={() => handleMonthChange('prev')}>
            <Ionicons name="chevron-back-outline" size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleMonthChange('next')}>
            <Ionicons name="chevron-forward-outline" size={24} />
          </TouchableOpacity>
        </View>

      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (<TransactionShimmer />
        ) : filteredGrouped.length === 0 ? (
          <View >
            <Text style={{ textAlign: "center" }}>No Transaction History</Text>
          </View>
        ) : (
          filteredGrouped.map((dayData, index) => (
            <View key={index} style={styles.daySection}>
              <Text style={styles.dayHeader}>
                {dayData.day}, {dayData.date} {month.format('MMMM YYYY')}
              </Text>
              {dayData.items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.item}
                  onPress={() => {
                    setSelectedTransaction(item);
                    setModalVisible(true);
                  }}
                >
                  <View style={{ width: 50, height: 50, marginRight: 10, borderRadius: 50, backgroundColor: alphabetColors[item?.category[0]?.toLowerCase()] || "#C68EFD", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>{item?.category[0]}</Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                  </View>
                  <View style={styles.itemAmount}>
                    <Text style={{ color: item.type === 'income' ? 'green' : 'red', fontSize: 16 }}>₹{item.amount}</Text>
                  </View>
                </TouchableOpacity>

              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => { }}>
              <View style={styles.modalContainer}>
                <View style={styles.iconWrapper}>
                  <View style={{ width: 70, height: 70, backgroundColor: "#26897C", borderRadius: 50, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                    {selectedTransaction?.type == "income" ?
                      <AntDesign name="download" size={28} color="white" /> :
                      <AntDesign name="upload" size={28} color="white" />
                    }
                  </View>
                </View>
                <View style={{ display: "flex", flexDirection: "row", justifyContent :"flex-end", width :"100%", alignItems : "flex-end" }}>
                  <TouchableOpacity onPress={() => handleDelete(selectedTransaction)}><MaterialIcons name="delete-outline" size={24} color="black" /></TouchableOpacity>
                </View>
                <View>
                  <Text style={{ textAlign: "center", color: selectedTransaction?.type === 'income' ? 'green' : 'red', fontSize: 16, marginVertical: 20, marginTop: 30, fontSize: 38, fontWeight: 500 }}>₹{selectedTransaction?.amount}</Text>
                </View>

                <View style={{ display: "flex", alignItems: "center", justifyContent: "space-evenly", flexDirection: "row" }}>
                  <View style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5 }}>
                    <Fontisto name="date" size={16} color="#828281" />
                    <Text style={{ fontSize: 16, color: "#828281" }}>{selectedTransaction?.date}</Text>
                  </View>
                  <View style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5 }}>
                    <FontAwesome6 name="clock-four" size={16} color="#828281" />
                    <Text style={{ fontSize: 16, color: "#828281" }}>{selectedTransaction?.time}</Text>
                  </View>
                </View>
                <View style={styles.card}>
                  <DetailRow label="Amount" value={`₹${selectedTransaction?.amount}`} boldValue />
                  <DetailRow label="Category" value={selectedTransaction?.category} />
                  <DetailRow label="Account" value={selectedTransaction?.accountName} />
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View >
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  header: {
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginRight: 10,
    fontSize: 16
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconWrapper: {
    position: 'absolute',
    top: -33,
    left: '50%',
    transform: [{ translateX: -14 }],

  },

  icon: {
    marginRight: 10,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  month: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    marginTop: 10,
  },
  daySection: {
    marginBottom: 20,
  },
  dayHeader: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: "#D8D9DA",
    borderRadius: 10,
    // padding: 12,
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemCategory: {
    fontWeight: '500',
    fontSize: 16,
  },
  itemBank: {
    fontSize: 12,
    color: '#777',
  },
  itemAmount: {
    alignItems: 'flex-end',
  },
  itemTime: {
    fontSize: 12,
    color: '#777',
  },
  modalOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    // borderBottomColor: '#e0e0e0',
    // borderBottomWidth: 1,
  },
  label: {
    color: '#696969',
    fontSize: 15,
  },
  value: {
    color: '#111',
    fontSize: 15,
  },
  boldValue: {
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#26897C',
    borderRadius: 8,
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

});

function DetailRow({ label, value, boldValue }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, boldValue && styles.boldValue]}>{value}</Text>
    </View>
  );
}