import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet, Animated, Easing, Switch, Text } from 'react-native';
import { useState, useRef, useEffect, useContext } from 'react';
import { SettingsContext, SettingsProvider } from '@/context/SettingsContext';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function TabLayout() {
  return (
    // Owijamy całość w SettingsProvider, by każdy ekran miał dostęp do isSeniorMode
    <SettingsProvider>
      <TabLayoutInner />
    </SettingsProvider>
  );
}

function TabLayoutInner() {

  const themeColors = useThemeColors();

  // Wartości senior moda pochodzą teraz z contextu który jest dostępny dla całej aplikacji
  const { isSeniorMode, setIsSeniorMode } = useContext(SettingsContext);
  const { isHighContrast, setIsHighContrast } = useContext(SettingsContext);
  const { fontSizeLevel, setFontSizeLevel } = useContext(SettingsContext);


  // Funkcje do zmiany ustawień
  const toggleUserMode = () => setIsSeniorMode(!isSeniorMode) 
  const toggleContrast = () => setIsHighContrast(!isHighContrast);
  const cycleFontSize = () => setFontSizeLevel((prev) => (prev + 1) % 3);

  //zabawa z suwakiem
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isSeniorMode ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false,
    }).start();
  }, [isSeniorMode]);

  const animatedBackground = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#444', '#fff'], // ciemne tło -> jasne
  });

  const animatedTextColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#fff', '#126A91'],
  });


  const TopMenuBar = () => (
  <View style={[styles.topMenuContainer, { backgroundColor: themeColors.background }]}>
    <TouchableOpacity onPress={toggleUserMode} style={styles.customSwitchWrapper}>
      <View style={[
        styles.customSwitchTrack,
        { backgroundColor: isSeniorMode ? themeColors.switchTrackActive : themeColors.switchTrack }
      ]}>
        <View style={[
          styles.customThumb,
          {
            backgroundColor: isSeniorMode ? themeColors.switchThumbActive : themeColors.switchThumb,
            transform: [{ translateX: isSeniorMode ? 48 : 0 }],
          }
        ]}>
          <Text style={[
            styles.thumbText, 
            { color: (isHighContrast && !isSeniorMode) ? '#fff' : themeColors.accent }
          ]}>
            {isSeniorMode ? 'O' : 'S'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>

    <TouchableOpacity onPress={toggleContrast} style={styles.iconButton}>
      <Ionicons 
        name={isHighContrast ? "contrast" : "contrast-outline"} 
        size={40} 
        color={isHighContrast ? themeColors.accent : themeColors.iconInactive} 
      />
    </TouchableOpacity>

    <TouchableOpacity onPress={cycleFontSize} style={styles.iconButton}>
      <MaterialCommunityIcons 
        name="format-font-size-increase" 
        size={40} 
        color={fontSizeLevel > 0 ? themeColors.accent : themeColors.iconInactive} 
      />
    </TouchableOpacity>
  </View>
);


  return (
    <>
    <TopMenuBar />

    <Tabs
  screenOptions={{
    tabBarActiveTintColor: themeColors.accent,
    headerStyle: {
      backgroundColor: themeColors.headerBackground,
    },
    headerTintColor: themeColors.text,
    tabBarStyle: {
      backgroundColor: themeColors.tabBarBackground,
      height: 120,
      paddingBottom: 50,
    },
    tabBarItemStyle: {
      height: '100%',
      justifyContent: 'center',
    },
    tabBarIconStyle: {
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
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
  customSwitchWrapper: {
    marginTop: 14,
    marginRight: 'auto',
    paddingLeft: 10,
  },
  customSwitchTrack: {
    width: 90, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: '#666',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  customSwitchTrackActive: {
    backgroundColor: '#cce6f4',
  },
  customThumb: {
    width: 34, 
    height: 34, 
    borderRadius: 17,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: 0 }],
  },
  
  customThumbActive: {
    backgroundColor: '#fff',
    transform: [{ translateX: 48 }],
  },
  thumbText: {
    fontWeight: 'bold',
    fontSize: 18, 
    color: '#126A91',
  },
  
});


