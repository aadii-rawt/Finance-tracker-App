import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
    onNext: () => void;
}

const AccountDetailsStep : React.FC<Props> = ({ onNext})  => {
    const [accountName, setAccountName] = useState('');
    const [accountType, setAccountType] = useState('');
    const [creationDate, setCreationDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [balance, setBalance] = useState('');

    const handleDateChange = (selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setCreationDate(selectedDate);
        }
    };

    const handleContinue = (): void => {
        onNext()
    }
    return (
        <View className="flex justify-between h-screen bg-white px-6 p-6">
            <View>


                <Text className="text-2xl font-bold mb-4">Account Details</Text>

                <Text className="text-base mb-1">Account Name</Text>
                <TextInput
                    placeholder="e.g., Cash, SBI Savings"
                    className="border border-gray-300 rounded-md px-4 py-3 mb-1"
                    value={accountName}
                    onChangeText={setAccountName}
                />
                <Text className="text-xs text-gray-500 mb-4">Only letters and spaces allowed</Text>

                <Text className="text-base mb-1">Account Type</Text>
                <View className="border border-gray-300 rounded-md mb-4">
                    <Picker
                        selectedValue={accountType}
                        onValueChange={(itemValue) => setAccountType(itemValue)}
                    >
                        <Picker.Item label="Select type" value="" />
                        <Picker.Item label="Savings" value="savings" />
                        <Picker.Item label="Checking" value="checking" />
                        <Picker.Item label="Cash" value="cash" />
                    </Picker>
                </View>

                <Text className="text-base mb-1">Date of Creation</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="border border-gray-300 rounded-md px-4 py-3 mb-4"
                >
                    <Text className="text-gray-600">
                        {creationDate.toLocaleDateString('en-GB')}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={creationDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}

                <Text className="text-base mb-1">Current Balance</Text>
                <TextInput
                    placeholder="e.g., 5000"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-md px-4 py-3 mb-1"
                    value={balance}
                    onChangeText={setBalance}
                />
                <Text className="text-xs text-gray-500 mb-6">Must be a valid number (min: 0)</Text>
            </View>

            <View>
                <TouchableOpacity
                    onPress={handleContinue}
                    className="bg-[#26897C] py-2.5 rounded-3xl "
                >
                    <Text className="text-white text-center text-lg font-semibold">
                        Next
                    </Text>
                </TouchableOpacity>
                <View className="flex-row justify-center mt-6">
                    {Array.from({ length: 4 }).map((_, index) => {
                        const isActive = index + 1 === 2;
                        return (
                            <View
                                key={index}
                                className={`w-2 h-2 rounded-full mx-1 ${isActive ? 'bg-gray-500' : 'bg-gray-300'
                                    }`}
                            />
                        );
                    })}
                </View>
            </View>
        </View>
    );
}


export default AccountDetailsStep