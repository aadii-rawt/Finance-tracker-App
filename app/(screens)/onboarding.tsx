// src/onboarding/OnboardingStep1.js
import AccountDetailsStep from '@/components/onboarding/AccountDetailsStep';
import BusinessDetails from '@/components/onboarding/BusinessDetails';
import CashAmount from '@/components/onboarding/CashAmount';
import CategoryStep from '@/components/onboarding/CategoryStep';
import MobileNumberStep from '@/components/onboarding/mobileNumber';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

export default function Onboarding() {

    const {user} = useAuth()
    console.log(user);
    
    const [step, setStep] = useState<number>(user.currentStep || 1);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#000" barStyle="light-content" />
            <View style={styles.container}>
                <View style={{ height: "100%" }}>
                    {step === 1 && <MobileNumberStep onNext={() => setStep(2)} />}
                    {step === 2 && <AccountDetailsStep onNext={() => setStep(3)} />}
                    {step === 3 && <CashAmount onNext={() => setStep(4)} />}
                    {step === 4 && <BusinessDetails onNext={() => setStep(5)} />}
                    {step === 5 && <CategoryStep  />}
                </View>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "white",
        // justifyContent: "center",
        // alignItems: "center",
        paddingHorizontal: 5,
        paddingTop : 20
    },
})