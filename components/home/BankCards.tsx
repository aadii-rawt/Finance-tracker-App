// components/BAml.js
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BankCards = () => {
    const [accounts, setAccounts] = useState([]);
    const { user } = useAuth()

    useEffect(() => {
        const fetchBanks = async () => {
            if (!user) return;
            const userRef = doc(db, "banks", user?.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const banksData = docSnap.data();
                setAccounts(banksData?.banks || []);
            }
        };

        fetchBanks();
    }, [user]);

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Accounts</Text>
                <Text style={styles.arrow}>›</Text>
            </View>

            <View style={styles.accountGrid}>
                {accounts.map((account, index) => (
                    <View key={index} style={[styles.item, { width: '40%' }]}>
                        <View style={[styles.iconCircle, { backgroundColor: account?.bgColor || '#ccc' }]}>
                            {account?.accountType == "Cash" ?
                            <FontAwesome5 name="money-bill" size={24} color="#26897C" /> :
                            <MaterialCommunityIcons name="bank" size={24} color="#26897C" /> }
                        </View>
                        <View>
                            <Text style={styles.accountName} numberOfLines={1} ellipsizeMode="tail" >{account?.accountName}</Text>
                            <Text style={styles.accountAmount}>₹{account?.initialBalance}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );
};

export default BankCards;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f2f2f2',
        borderRadius: 18,
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        color: '#000',
    },
    arrow: {
        fontSize: 20,
        color: '#999',
    },
    accountGrid: {
        marginTop: 5,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 5,
        justifyContent: "space-between",
        rowGap: 20,
        overflow: "hidden",
        width : "100%"
    },
    item: {
        display: "flex",
        flexDirection: "row",
        alignItems: 'center',
        gap: 10,
        // backgroundColor: "#e2e2e2",
        borderRadius: 8,
        marginBottom: 5,
        // padding: 20,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: 8,
    },
    iconText: {
        fontSize: 24,
    },
    accountName: {
        fontSize: 18,
        color: '#333',
        flexShrink: 1,
    },
    accountAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
});

