import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const Welcome= () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Character Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/images/Man.png')} // <-- put your image in assets and adjust path
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Spend Smarter{'\n'}Save More</Text>

        <TouchableOpacity style={styles.getStartedButton} onPress={() => router.push('/signup')}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Already Have Account? <Text style={{ color: '#26897C' }}>Log In</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  imageContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#195A5A',
    textAlign: 'center',
    marginBottom: 30,
  },
  getStartedButton: {
    backgroundColor: '#26897C',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  getStartedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginText: {
    color: '#888',
    marginTop: 5,
  },
});
