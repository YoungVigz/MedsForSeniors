import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Harmonogram() {

  async function clearAllStorage() {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error(e);
    }
  }


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tu harmonogram leków</Text>
      <Button title="Wyczyść storage" onPress={clearAllStorage} />
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
  }
});
