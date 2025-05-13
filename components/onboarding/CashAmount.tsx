import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
    onNext: () => void;
}

const CashAmount: React.FC<Props> = ({ onNext }) => {
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");

    const handleContinue = () => {
        onNext()
    };

    return (
        <KeyboardAvoidingView
            className="flex flex-col justify-between h-screen p-6"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View className="mb-8">
                <Text className="text-2xl font-bold text-gray-800 mb-2">
                    Initial Cash Amount
                </Text>
                <TextInput
                    className="border border-gray-400  rounded-3xl px-4 py-2 text-lg text-black mb-2"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholder="e.g. ₹500"
                    value={amount}
                    onChangeText={setAmount}
                    placeholderTextColor={"#6b7280"}
                />
                {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}
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
                        const isActive = index + 1 === 3;
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

        </KeyboardAvoidingView>
    );
};

export default CashAmount;
