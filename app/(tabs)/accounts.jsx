import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
} from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { decryptData } from "../../utils/encryption";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator } from "react-native";
import CreateBankModal from "../../components/createBankAccount";

const Account = () => {
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
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Bank Accounts</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#26897C"
          style={{ marginTop: 50 }}
        />
      ) : (
        <>
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: "#26897C",
              padding: 15,
              borderRadius: 10,
              color: "white",
              alignItems: "center",
            }}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={{ fontSize: 20, color: "white" }}>+ Add Bank</Text>
          </TouchableOpacity>

          {banks.map((bank, index) => (
            <View key={index} style={styles.bankCard}>
              {/* Bank Details */}
              <View>
                <Text style={styles.bankName}>{bank.accountName}</Text>
                <Text style={styles.accountNumber}>{bank.accountNumber}</Text>
                <Text style={styles.balance}>₹ {bank.initialBalance}</Text>
                <Text style={styles.accountType}>
                  {bank.accountType} Account
                </Text>
              </View>
              {/* Actions */}
              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity
                  onPress={() => handleDelete(bank.accountName)}
                >
                  <Text style={{ color: "red", fontSize: 12 }}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.defaultButton,
                    defaultBank === bank.accountName && styles.activeDefault,
                  ]}
                  onPress={() => handleSetDefault(bank.accountName)}
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
              
              {showCreateModal && (
                <CreateBankModal
                  visible={showCreateModal}
                  onClose={() => setShowCreateModal(false)}
                  fetchBanks={fetchBanks}
                />
              )}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
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
  addButton: {
    marginTop: 20,
    backgroundColor: "#26897C",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});
