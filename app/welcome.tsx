import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;       
  const fadeInputAnim = useRef(new Animated.Value(0)).current;    
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkName = async () => {
      const stored = await AsyncStorage.getItem('userName');
      if (stored) {
        router.replace('/'); 
      } else {
        startAnimation();
      }
    };
    checkName();
  }, []);

  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      setShowInput(true);
      Animated.timing(fadeInputAnim, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSave = async () => {
    if (name.trim().length > 0) {
      await AsyncStorage.setItem('userName', name.trim());
      router.replace('/');
    }
  };

return (
  <View style={styles.container}>
    <Animated.Image
      source={require('../assets/images/meds-logo.png')}
      style={[
        styles.logo,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    />

    <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
      MedsForSeniors
    </Animated.Text>

    <Animated.View
      style={[
        styles.inputContainer,
        {
          opacity: fadeInputAnim,
          transform: [
            {
              translateY: fadeInputAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.label}>Jak masz na imię?</Text>
      <TextInput
        style={styles.input}
        placeholder="Wpisz imię"
        value={name}
        onChangeText={setName}
      />
      <Button title="Start" onPress={handleSave} color="#126A91" />
    </Animated.View>
  </View>
);


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#126A91',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#126A91',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  inputContainer: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
    
},
logo: {
  width: 60,
  height: 60,
  position: 'absolute',
  top: 40,      // dostosuj pod swoje urządzenie
  left: 20,
  zIndex: 10,
}
});
