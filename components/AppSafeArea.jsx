import React from "react";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AppSafeArea = ({ children, backgroundColor = "#000" }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View style={{ paddingTop: insets.top, backgroundColor ,}} />
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      {children}
    </View>
  );
};

export default AppSafeArea;
