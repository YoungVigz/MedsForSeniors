import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;       
  const fadeInputAnim = useRef(new Animated.Value(0)).current;    
  const [name, setName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const fadeTextAnim = useRef(new Animated.Value(0)).current;



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
  Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1500,
    useNativeDriver: true,
  }),
  Animated.timing(fadeTextAnim, {
    toValue: 1,
    duration: 2000,
    useNativeDriver: true,
  }),
]).start(() => {
    Animated.timing(fadeTextAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setShowWelcome(false); 
      Animated.timing(fadeTextAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setShowInput(true);
        Animated.timing(fadeInputAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
      });
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

<Animated.View style={{ opacity: fadeTextAnim }}>
  <Text style={styles.title}>
    {showWelcome ? (
      <>
        Witaj w{'\n'}
        <Text style={styles.brand}>MedsForSeniors!</Text>
      </>
    ) : (
      <>
        Wprowadź swoje{'\n'}
        <Text style={styles.brand}>imię.</Text>
      </>
    )}
  </Text>
</Animated.View>

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
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
        <View style={styles.buttonWrapper}>
    <TouchableOpacity style={styles.button} onPress={handleSave}>
      <Text style={styles.buttonText}>Rozpocznij</Text>
    </TouchableOpacity>
  </View>   
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
  position: 'relative',   
},
title: {
  fontSize: 38,
  fontWeight: 'bold',
  color: '#000',
  width: '100%',
},

brand: {
  color: '#126A91',
  fontStyle: 'italic',
  fontSize: 38,
},
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
input: {
  width: '70%',
  borderWidth: 1,
  borderColor: 'grey',
  padding: 15,
  marginBottom: 10,
  borderRadius: 40,
},
  inputContainer: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
    marginTop: 20,
},
logo: {
  width: 60,
  height: 60,
  position: 'absolute',
  top: 50,    
  right: 50,   
  zIndex: 10,
},
buttonWrapper: {
  position: 'absolute',
  top: '280%', 
  left: 0,
  right: 0,
  alignItems: 'center',
},
button: {
  backgroundColor: '#126A91',
  paddingVertical: 12,
  paddingHorizontal: 25,
  borderRadius: 20,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
});
