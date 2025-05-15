// src/onboarding/OnboardingStep1.js
import CategoryStep from '@/components/onboarding/StepFive';
import BusinessDetails from '@/components/onboarding/StepFour';
import MobileNumberStep from '@/components/onboarding/StepOne';
import CashAmount from '@/components/onboarding/StepThree';
import AccountDetailsStep from '@/components/onboarding/StepTwo';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

export default function Onboarding() {

    const {user} = useAuth()
    console.log(user);
    
    const [step, setStep] = useState<number>(user?.currentStep || 0);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#000" barStyle="light-content" />
            <View style={styles.container}>
                <View style={{ height: "100%" }}>
                    {step === 0 && <MobileNumberStep onNext={() => setStep(1)} />}
                    {step === 1 && <AccountDetailsStep onNext={() => setStep(2)} />}
                    {step === 2 && <CashAmount onNext={() => setStep(3)} />}
                    {step === 3 && <BusinessDetails onNext={() => setStep(4)} />}
                    {step === 4 && <CategoryStep />}
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