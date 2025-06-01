import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Animated, Easing, Text } from 'react-native';
import { useState, useRef, useEffect } from 'react';

export default function TabLayout() {
  const [isSeniorMode, setIsSeniorMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(0);

  // Funkcje do zmiany ustawień
  const toggleUserMode = () => setIsSeniorMode(!isSeniorMode);
  const toggleContrast = () => setIsHighContrast(!isHighContrast);
  const cycleFontSize = () => setFontSizeLevel((prev) => (prev + 1) % 3);

  //zabawa z suwakiem
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isSeniorMode ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false, // zmieniamy kolory, więc musi być false
    }).start();
  }, [isSeniorMode]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#444', '#fff']
  });

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#126A91']
  });

  const TopMenuBar = () => (
    <View style={styles.topMenuContainer}>
      <TouchableOpacity onPress={toggleUserMode} style={styles.iconButton}>
      <Animated.View style={[styles.sliderButton, { backgroundColor }]}>
        <Animated.Text style={[styles.sliderText, { color: textColor }]}>
          {isSeniorMode ? 'S' : 'O'}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
      
      <TouchableOpacity onPress={toggleContrast} style={styles.iconButton}>
        <Ionicons 
          name={isHighContrast ? "contrast" : "contrast-outline"} 
          size={40} 
          color={isHighContrast ? "#126A91" : "#fff"} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={cycleFontSize} style={styles.iconButton}>
        <MaterialCommunityIcons 
          name="format-font-size-increase" 
          size={40} 
          color={fontSizeLevel > 0 ? "#126A91" : "#fff"} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
    <TopMenuBar />

    <Tabs 
      screenOptions={{
        tabBarActiveTintColor: '#126A91',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
          height: 110, 
          paddingBottom: 10, 
        },
        tabBarItemStyle: {
          height: '100%',
          padding: 10,
        },
        tabBarIconStyle: {
          height: '100%',
          width: '100%',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >

      <Tabs.Screen
        name="harmonogram"
        options={{
          headerShown: false,
          title: 'Harmonogram' ,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={50} />
          ),
        }}
      />

      <Tabs.Screen
        name="leki"
        options={{
          title: 'Leki na dziś',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name='pill' color={color} size={50} />
          ),
        }}
      />

      <Tabs.Screen
        name="apteczka"
        options={{
          title: 'Apteczka',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'medkit' : 'medkit-outline'} color={color} size={50}/>
          ),
        }}
      />

    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  topMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#25292e',
    paddingTop: 40, // Uwzględnienie obszaru StatusBar
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  iconButton: {
    padding: 10,
    marginLeft: 15,
  },
  sliderButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  activeText: {
    color: '#126A91',
  },
  
});