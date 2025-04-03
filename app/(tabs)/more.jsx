import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome, Entypo } from '@expo/vector-icons';
import { decryptData } from "../../utils/encryption";

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
      {/* Profile Section */}
      <View style={styles.avatarSection}>
        <Image
          source={require('../../assets/images/profile.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{decryptData(user?.username) || 'Unknown User'}</Text>
      </View>

      {/* Grid Menu */}
      <View style={styles.grid}>
        <GridItem icon={<MaterialIcons name="person-outline" size={24} color="#26897C" />} label="Personal Profile" />
        <GridItem icon={<FontAwesome name="gear" size={24} color="#26897C" />} label="Invite Friends" />
        <GridItem icon={<FontAwesome name="bank" size={24} color="#26897C" />} label="Invite Friends" />
        {/* <GridItem icon={<Ionicons name="person" size={24} color="#26897C" />} label="Account Info" /> */}
        <GridItem icon={<Ionicons name="mail-outline" size={24} color="#26897C" />} label="Message Center" />
        <GridItem icon={<Ionicons name="lock-closed-outline" size={24} color="#26897C" />} label="Login & Security" />
        {/* <GridItem icon={<Entypo name="lock" size={24} color="#26897C" />} label="Data & Privacy" /> */}
        <GridItem icon={<MaterialIcons name="logout" size={24} color="red" />} label="Logout" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const GridItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    {icon}
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems : "center", justifyContent : "center" },
  avatarSection: { alignItems: 'center', marginVertical: 50 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#26897C' },
  name: { fontSize: 18, fontWeight: '700', marginTop: 10 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    gap: 20
  },
  gridItem: {
    width: '28%',
    marginBottom : 20,
    // aspectRatio: 1,
    // backgroundColor: '#f9f9f9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 2,
  },
  gridLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
});
