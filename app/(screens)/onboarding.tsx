// src/onboarding/OnboardingStep1.js
import AccountDetailsStep from '@/components/onboarding/AccountDetailsStep';
import CashAmount from '@/components/onboarding/CashAmount';
import MobileNumberStep from '@/components/onboarding/mobileNumber';
import { useNavigation } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { View } from 'react-native';

export default function Onboarding() {

    const navigation = useNavigation();
    const [step, setStep] = useState<number>(1);


    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    return (
        <View>
            {step === 1 && <MobileNumberStep onNext={() => setStep(2)} />}
            {step === 2 && <AccountDetailsStep onNext={() => setStep(3)} />}
            {step === 3 && <CashAmount onNext={() => setStep(4)} />}
        </View>
    );
}
