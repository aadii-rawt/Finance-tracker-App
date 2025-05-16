import { useNavigation, useRouter } from "expo-router";
import { useLayoutEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const settings = [
  {
    title: "Category/Repeat",
    items: [
      { label: "Income Category Setting", route: "/(configuration)/category?type=income" },
      { label: "Expenses Category Setting", route: "/(configuration)/category?type=expense" },
      // { label: "Subcategory", value: "OFF", route: "/subcategory" },
      { label: "Budget Setting", route: "/budget" },
      // { label: "Repeat Setting", route: "/repeat" },
    ],
  },
  {
    title: "Configuration",
    items: [
      { label: "Main Currency Setting", value: "INR (₹)", route: "/main-currency" },
      // { label: "Sub Currency Setting", route: "/sub-currency" },
      { label: "Start Screen (Daily/Calendar)", value: "Daily", route: "/start-screen" },
      { label: "Monthly Start Date", value: "Every 1", route: "/monthly-start-date" },
      // { label: "Weekly Start Day", value: "Sunday", route: "/weekly-start-day" },
      // { label: "Carry-over Setting", value: "OFF", route: "/carry-over" },
      // { label: "Swipe", value: "To Change Date", route: "/swipe-setting" },
      // { label: "Income-Expenses Color Setting", value: "Set. A", route: "/color-setting" },
    ],
  },
];

const Configuration = () => {


  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Configuration", 
    });
  }, [navigation]);



  return (
      <ScrollView style={styles.container}>
        {settings.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.row}
                onPress={() => router.push(item.route)}
              >
                <Text style={styles.label}>{item.label}</Text>
                {item.value && (
                  <Text
                    style={[styles.value, item.value === "OFF" || item.value === "Sunday" || item.value === "Daily" || item.value.startsWith("Every") ? styles.redText : {}]}
                  >
                    {item.value}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
  );
};

export default Configuration;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#888",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    marginBottom: 5,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 16, color: "#111" },
  value: { fontSize: 14, color: "#555" },
  redText: { color: "#d00" },
});
