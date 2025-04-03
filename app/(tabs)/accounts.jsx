import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { decryptData } from "../../utils/encryption";
import { useAuth } from "../../context/AuthContext";
import CreateBankModal from "../../components/createBankAccount";

const Account = ({ navigation }) => {
  const { user, setNotification } = useAuth();
  const [banks, setBanks] = useState([]);
  const [defaultBank, setDefaultBank] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanks = async () => {
      if (!user) return;
      setLoading(true);
      const userRef = doc(db, "banks", decryptData(user.uid));
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = decryptData(docSnap.data());
        setBanks(data.banks || []);
        setDefaultBank(data.defaultBankAccount || "");
      }
      setLoading(false);
    };

    fetchBanks();
  }, [user]);

  const fetchBanks = async () => {
    const userRef = doc(db, "banks", decryptData(user.uid));
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setBanks(data.banks || []);
      setDefaultBank(data.defaultBankAccount || null);
    }
  };

  const deleteBank = async (bank) => {
    if (bank.accountType === "Cash") {
      return setNotification({
        msg: "Cash account cannot be deleted",
        type: "error",
      });
    }

    const updatedBanks = banks.filter(
      (b) => b.accountName !== bank.accountName
    );
    await updateDoc(doc(db, "banks", decryptData(user.uid)), {
      banks: updatedBanks,
    });

    if (defaultBank === bank.accountName) {
      await updateDoc(doc(db, "banks", decryptData(user.uid)), {
        defaultBankAccount: null,
      });
      setDefaultBank(null);
    }

    setNotification({ msg: "Bank deleted successfully", type: "success" });
    fetchBanks();
  };

  const setAsDefault = async (bankName) => {
    await updateDoc(doc(db, "users", decryptData(user.uid)), {
      defaultBankAccount: bankName,
    });
    setDefaultBank(bankName);
    setNotification({ msg: "Default bank updated", type: "success" });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        {/* <View style={styles.topRow}>
          <Text style={styles.title}>Account</Text>
          
        </View> */}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={34} color="#26897C" />
            </TouchableOpacity>
            <Text style={{color : "white",  textAlign: "center", marginTop : 10,fontSize : 16}}>Add</Text>
          </View>

          <View>
            <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
              <Ionicons name="send" size={28} color="#26897C" />
            </TouchableOpacity>
            <Text style={{color : "white",  textAlign: "center", marginTop : 10,fontSize : 16}}>Transfer</Text>
          </View>
        </View>
      </View>

      {/* Bank List */}
      <ScrollView style={{ padding: 20 }}>
        <Text style={styles.heading}>Bank Accounts</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#26897C"
            style={{ marginTop: 50 }}
          />
        ) : (
          banks.map((bank, index) => (
            <View key={index} style={styles.bankCard}>
              <View>
                <Text style={styles.bankName}>{bank.accountName}</Text>
                <Text style={styles.accountNumber}>{bank.accountNumber}</Text>
                <Text style={styles.balance}>₹ {bank.initialBalance}</Text>
                <Text style={styles.accountType}>
                  {bank.accountType} Account
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity onPress={() => deleteBank(bank)}>
                  <Text style={{ color: "red", fontSize: 12 }}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.defaultButton,
                    defaultBank === bank.accountName && styles.activeDefault,
                  ]}
                  onPress={() => setAsDefault(bank.accountName)}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: defaultBank === bank.accountName ? "#fff" : "#000",
                    }}
                  >
                    {defaultBank === bank.accountName
                      ? "Default"
                      : "Set Default"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {showCreateModal && (
        <CreateBankModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          fetchBanks={fetchBanks}
        />
      )}
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#26897C",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 50,
    paddingTop: 100,
    paddingBottom: 50,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 50,
    // padding: 15,
    width : 60,
    height : 60,
    elevation: 3,
  display : "flex",
  flexDirection : "row",
  alignItems : "center",
  justifyContent : "center"
  },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  bankCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  bankName: { fontSize: 16, fontWeight: "bold", textTransform: "capitalize" },
  accountNumber: { fontSize: 14, color: "#555" },
  balance: { fontSize: 14, marginTop: 5, fontWeight: "600" },
  accountType: { fontSize: 12, color: "#888" },
  defaultButton: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 5,
  },
  activeDefault: {
    backgroundColor: "#26897C",
    borderColor: "#26897C",
  },
});
