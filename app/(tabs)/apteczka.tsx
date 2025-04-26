import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

export default function Apteczka() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Apteczka</Text>
      <Link href="/leki" style={styles.button}>
        Leki Gaming
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white'
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
