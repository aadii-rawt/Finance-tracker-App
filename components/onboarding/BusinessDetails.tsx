import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
    onNext: () => void;
}

const BusinessDetails : React.FC<Props> = ({ onNext})  => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [employee, setemployee] = useState('');

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


                <Text className="text-2xl font-bold mb-4">Business Details</Text>

                <Text className="text-base mb-1">Account Name</Text>
                <TextInput
                    placeholder="e.g., Cash, SBI Savings"
                    className="border border-gray-300 rounded-md px-4 py-3 mb-1"
                    value={name}
                    onChangeText={setName}
                />
                <Text className="text-base mb-1">Address</Text>
                <TextInput
                    placeholder="e.g., Cash, SBI Savings"
                    className="border border-gray-300 rounded-md px-4 py-3 mb-1"
                    value={address}
                    onChangeText={setAddress}
                />
                {/* <Text className="text-xs text-gray-500 mb-4">Only letters and spaces allowed</Text> */}

                <Text className="text-base mb-1">Account Type</Text>
                <View className="border border-gray-300 rounded-md mb-4">
                    <Picker
                        selectedValue={businessType}
                        onValueChange={(itemValue) => setBusinessType(itemValue)}
                    >
                        <Picker.Item label="Select type" value="" />
                        <Picker.Item label="Savings" value="savings" />
                        <Picker.Item label="Checking" value="checking" />
                        <Picker.Item label="Cash" value="cash" />
                    </Picker>
                </View>

                <Text className="text-base mb-1">Number of Employees</Text>
                <TextInput
                    placeholder="e.g., 5000"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-md px-4 py-3 mb-1"
                    value={employee}
                    onChangeText={setemployee}
                />
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
                    {Array.from({ length: 5 }).map((_, index) => {
                        const isActive = index + 1 === 4;
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


export default BusinessDetails