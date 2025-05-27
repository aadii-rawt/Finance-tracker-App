import CustomHeader from '@/components/CustomHeader';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const RecurringTransaction = () => {
    const { user } = useAuth();
    const [recurringTransactions, setRecurringTransactions] = useState([]);
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            const docRef = doc(db, "recurring_transactions", user.uid);

            const unsubscribe = onSnapshot(
                docRef,
                (docSnap) => {
                    if (docSnap.exists()) {
                        const transactions = docSnap.data().recurringTransactions || [];
                        const income = transactions.filter(t => t.amount > 0);
                        const expenses = transactions.filter(t => t.amount <= 0);
                        const sortedTransactions = [...income, ...expenses];
                        setRecurringTransactions(sortedTransactions);
                    } else {
                        setRecurringTransactions([]);
                    }
                    setLoading(false);
                },
                (err) => {
                    console.error("Error fetching recurring transactions:", err);
                    setError("Failed to fetch recurring transactions.");
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        }
    }, [user]);

    const toggleSelect = (index) => {
        if (selectedTransactions.includes(index)) {
            setSelectedTransactions(prev => prev.filter(i => i !== index));
        } else {
            setSelectedTransactions(prev => [...prev, index]);
        }
    };

    const handleDelete = async () => {
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            return;
        }

        if (user && selectedTransactions.length > 0) {
            try {
                const docRef = doc(db, "recurring_transactions", user.uid);
                const newList = recurringTransactions.filter((_, idx) => !selectedTransactions.includes(idx));
                await updateDoc(docRef, {
                    recurringTransactions: newList
                });
                setSelectedTransactions([]);
                setIsSelectionMode(false);
            } catch (error) {
                console.error("Failed to delete selected transactions:", error);
                setError("Failed to delete transactions.");
            }
        } else {
            setIsSelectionMode(false); // Exit selection mode if nothing selected
        }
    };

    return (
        <View>
            <CustomHeader
                title="Repeat Transaction"
                action={
                    <TouchableOpacity style={{ marginRight: 15 }} onPress={handleDelete}>
                        <MaterialIcons name={isSelectionMode ? "done" : "delete-outline"} size={24} color="black" />
                    </TouchableOpacity>
                }
            />
            {loading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <Text>{error}</Text>
            ) : (
                recurringTransactions.map((txn, index) => {
                    const isSelected = selectedTransactions.includes(index);
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => isSelectionMode && toggleSelect(index)}
                            style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: "#D8D9DA",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: isSelected ? "#e0e0e0" : "white"
                            }}
                        >
                            {/* Left side: Optional minus icon */}

                            {/* Main transaction info */}
                            <View style={{display :"flex", flexDirection : "row",  alignItems: "center", }}>
                            {isSelectionMode && (
                                <TouchableOpacity onPress={() => toggleSelect(index)} style={{ marginRight: 10 }}>
                                    <MaterialIcons
                                        name="remove-circle-outline"
                                        size={22}
                                        color={isSelected ? "red" : "gray"}
                                    />
                                </TouchableOpacity>
                            )}

                            <View>
                                {/* <Text style={{
                                    fontSize: 15,
                                    color: txn?.status === "ended" ? "red" : txn?.status === "active" ? "green" : "#F3C623"
                                }}>{txn?.status}</Text> */}
                                <Text style={{
                                    fontSize: 13,
                                    color: "gray",
                                    textTransform: "capitalize"
                                }}>{txn?.startDate}</Text>
                                <Text style={{
                                    fontSize: 13,
                                    color: "gray",
                                    textTransform: "capitalize"
                                }}>{txn?.recurringType}</Text>
                            </View>
                            </View>

                            <Text style={{ fontSize: 16, fontWeight: "600" }}>{txn?.category}</Text>
                            <Text style={{
                                color: txn.type === "income" ? "green" : "red",
                                fontWeight: "500",
                                fontSize: 15
                            }}>₹{txn?.amount}</Text>
                        </TouchableOpacity>
                    );
                })
            )}
        </View>
    );
};

export default RecurringTransaction;
