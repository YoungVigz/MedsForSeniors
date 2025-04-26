import { StyleSheet, Text, View } from 'react-native';

export default function Harmonogram() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, to MedsForSeniors!</Text>
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
