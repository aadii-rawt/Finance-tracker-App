import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useLayoutEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const NewCategory = () => {
    const { type } = useLocalSearchParams();
    const router = useRouter();

    const [categoryName, setCategoryName] = useState('');
    const [categoryType, setCategoryType] = useState(type || 'income');
    const { user } = useAuth()

    const navigation = useNavigation();
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: categoryType == "income" ? "Income Category" : "Expense Category",
        });
    }, [navigation]);

    const handleSave = async () => {
        if (!categoryName.trim()) {
            return;
        }

        try {
            const docRef = doc(db, "categories", user?.uid);
            const docSnap = await getDoc(docRef);

            let updatedCategories = [];

            if (docSnap.exists()) {
                const data = docSnap.data();
                updatedCategories = [...(data.category || [])];
            }

            // Check for duplicates
            const isDuplicate = updatedCategories.some(
                (item) =>
                    item.category.toLowerCase() === categoryName.trim().toLowerCase() &&
                    item.type === categoryType
            );

            if (isDuplicate) {
                alert("This category already exists.");
                return;
            }

            updatedCategories.push({
                category: categoryName.trim(),
                type: categoryType,
            });

            // Update the document with new encrypted data
            await updateDoc(docRef, { category: updatedCategories });
            console.log("Category saved successfully");
            router.back();
        } catch (err) {
            console.error("Error saving category:", err);
            alert("Failed to save category");
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.label}>Category Name</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Shopping, Salary"
                value={categoryName}
                placeholderTextColor="#6e6d6b"
                onChangeText={setCategoryName}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default NewCategory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        // paddingTop: Platform.OS === 'android' ? 40 : 60,
    },
    label: {
        fontSize: 16,
        marginBottom: 6,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 20,
        fontSize: 16,
    },

    saveButton: {
        backgroundColor: '#26897C',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
