import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


const alphabetColors = {
  a: "#E53935", // Dark Red
  b: "#D81B60", // Dark Pink
  c: "#8E24AA", // Dark Purple
  d: "#5E35B1", // Dark Deep Purple
  e: "#3949AB", // Dark Indigo
  f: "#1E88E5", // Dark Blue
  g: "#039BE5", // Dark Light Blue
  h: "#00ACC1", // Dark Cyan
  i: "#00897B", // Dark Teal
  j: "#43A047", // Dark Green
  k: "#7CB342", // Dark Light Green
  l: "#C0CA33", // Dark Lime
  m: "#FDD835", // Dark Yellow
  n: "#FFB300", // Dark Amber
  o: "#FB8C00", // Dark Orange
  p: "#F4511E", // Dark Deep Orange
  q: "#6D4C41", // Dark Brown
  r: "#757575", // Dark Grey
  s: "#546E7A", // Dark Blue Grey
  t: "#D32F2F", // Darker Red
  u: "#C2185B", // Darker Pink
  v: "#7B1FA2", // Darker Purple
  w: "#512DA8", // Darker Deep Purple
  x: "#303F9F", // Darker Indigo
  y: "#1976D2", // Darker Blue
  z: "#0288D1"  // Darker Light Blue
};

export default function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [month, setMonth] = useState(moment());
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
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

  const filteredGrouped = allTransactions
    .filter(tx => {
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
        icon: tx.type === 'income' ? 'attach-money' : 'money-off',
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
        {filteredGrouped.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No Transaction History</Text>
          </View>
        ) : (
          filteredGrouped.map((dayData, index) => (
            <View key={index} style={styles.daySection}>
              <Text style={styles.dayHeader}>
                {dayData.day}, {dayData.date} {month.format('MMMM YYYY')}
              </Text>
              {dayData.items.map((item, idx) => (
                <View key={idx} style={styles.item}>
                  <View style={{width : 50, height : 50, marginRight : 10, borderRadius : 50,  backgroundColor: alphabetColors[item?.category[0]?.toLowerCase()]  || "#C68EFD",display : "flex", flexDirection : "row", alignItems : "center", justifyContent : "center"}}>
                    <Text style={{color : "white", fontSize : 24, fontWeight : "bold"}}>{item?.category[0]}</Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                  </View>
                  <View style={styles.itemAmount}>
                    <Text style={{ color: item.icon === 'attach-money' ? 'green' : 'red' , fontSize : 16}}>₹{item.amount}</Text>
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
    // backgroundColor: '#f9f9f9',
    borderRadius: 10,
    // padding: 12,
    alignItems: 'center',
    marginBottom: 15,
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
});
