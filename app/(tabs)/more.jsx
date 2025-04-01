import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase'; // adjust the path
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome, Entypo } from '@expo/vector-icons';
import {decryptData  } from "../../utils/encryption";
export default function More() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut(auth);
            setUser(null);
            router.replace('/login');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatarSection}>
        <Image
         source={require('../../assets/images/profile.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{decryptData(user?.username) || 'Unknown User'}</Text>
        {/* <Text style={styles.username}>@{user?.username?.toLowerCase() || 'username'}</Text> */}
      </View>

      {/* Menu List */}
      <View style={styles.menu}>
        <MenuItem icon={<FontAwesome name="diamond" size={20} color="#26897C" />} label="Invite Friends" />
        <MenuItem icon={<Ionicons name="person" size={20} color="#26897C" />} label="Account info" />
        <MenuItem icon={<MaterialIcons name="person-outline" size={20} color="#26897C" />} label="Personal profile" />
        <MenuItem icon={<Ionicons name="mail-outline" size={20} color="#26897C" />} label="Message center" />
        <MenuItem icon={<Ionicons name="lock-closed-outline" size={20} color="#26897C" />} label="Login and security" />
        <MenuItem icon={<Entypo name="lock" size={20} color="#26897C" />} label="Data and privacy" />

        {/* Logout */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, label }) => (
  <TouchableOpacity style={styles.menuItem}>
    {icon}
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#26897C',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginTop: 20 },
  avatar: { width: 90, height: 90, borderRadius: 40, borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 18, fontWeight: '700', marginTop: 10 },
  username: { color: '#888', fontSize: 13 },
  menu: { marginTop: 20, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  menuLabel: { marginLeft: 15, fontSize: 16 },
  logout: { marginTop: 30, alignItems: 'center' },
  logoutText: { color: 'red', fontWeight: '600', fontSize: 16 },
});
