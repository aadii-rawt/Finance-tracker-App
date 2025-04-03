// components/AppSafeArea.js

import React from "react";
import { SafeAreaView, StatusBar } from "react-native";

const AppSafeArea = ({ children, backgroundColor = "#26897C" }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      {children}
    </SafeAreaView>
  );
};

export default AppSafeArea;
