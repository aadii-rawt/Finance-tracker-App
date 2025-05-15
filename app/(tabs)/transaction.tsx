import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(moment()); // moment handles month logic
  const {user} = useAuth()

  useEffect(() => {
  const fetchTransactions = async () => {
    const docRef = doc(db, 'transactions', user?.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { income = [], expense = [] } = docSnap.data();
      const all = [...income, ...expense];

      // Filter transactions by current month
      const filtered = all.filter(tx => moment(tx.date).isSame(month, 'month'));

      // Sort by date (latest first)
      const sorted = filtered.sort((a, b) => moment(b.date).diff(moment(a.date)));

      // Group by day
      const grouped = sorted.reduce((acc, tx) => {
        const day = moment(tx.date).format('DD');
        const dayName = moment(tx.date).format('dddd');
        const time = moment.unix(tx.createdAt).format('h:mm a');
        const item = {
          category: tx.category,
          amount: tx.amount,
          time,
          icon: tx.type === 'income' ? 'attach-money' : 'money-off',
        };

        const groupIndex = acc.findIndex(g => g.date === day);
        if (groupIndex !== -1) {
          acc[groupIndex].items.push(item);
        } else {
          acc.push({
            date: day,
            day: dayName,
            items: [item],
          });
        }
        return acc;
      }, []);

      // Sort groups by day descending
      grouped.sort((a, b) => parseInt(b.date) - parseInt(a.date));

      setTransactions(grouped);
    } else {
      setTransactions([]);
    }
  };

  fetchTransactions();
}, [month]);


  const handleMonthChange = direction => {
    setMonth(prev => (direction === 'prev' ? moment(prev).subtract(1, 'month') : moment(prev).add(1, 'month')));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TextInput placeholder="Search" style={styles.searchInput} placeholderTextColor="#999" />
        <View style={styles.headerIcons}>
          <Ionicons name="calendar-outline" size={24} color="black" style={styles.icon} />
          <Ionicons name="share-social-outline" size={24} color="black" />
        </View>
      </View>

      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => handleMonthChange('prev')}>
          <Ionicons name="chevron-back-outline" size={24} />
        </TouchableOpacity>

        <Text style={styles.month}>{month.format('MMMM YYYY')}</Text>

        <TouchableOpacity onPress={() => handleMonthChange('next')}>
          <Ionicons name="chevron-forward-outline" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
  {transactions.length === 0 ? (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No Transaction History</Text>
    </View>
  ) : (
    transactions.map((dayData, index) => (
      <View key={index} style={styles.daySection}>
        <Text style={styles.dayHeader}>
          {dayData.day}, {dayData.date} {month.format('MMMM YYYY')}
        </Text>
        {dayData.items.map((item, idx) => (
          <View key={idx} style={styles.item}>
            <MaterialIcons name={item.icon} size={28} color="#333" style={styles.itemIcon} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemBank}>🏦 cash</Text>
            </View>
            <View style={styles.itemAmount}>
              <Text style={{ color: item.icon === 'attach-money' ? 'green' : 'red' }}>{item.amount}₹</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>
    ))
  )}
</ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    marginRight: 10,
  },
  headerIcons: {
    flexDirection: 'row',
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
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemCategory: {
    fontWeight: '500',
    fontSize: 14,
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
});
