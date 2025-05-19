import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function TabLayout() {
  const [isSeniorMode, setIsSeniorMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(0);

  // Funkcje do zmiany ustawień
  const toggleUserMode = () => setIsSeniorMode(!isSeniorMode);
  const toggleContrast = () => setIsHighContrast(!isHighContrast);
  const cycleFontSize = () => setFontSizeLevel((prev) => (prev + 1) % 3);

  const TopMenuBar = () => (
    <View style={styles.topMenuContainer}>
      <TouchableOpacity onPress={toggleUserMode} style={styles.iconButton}>
        <MaterialCommunityIcons 
          name={isSeniorMode ? "account-supervisor" : "account-supervisor-outline"} 
          size={40} 
          color={isSeniorMode ? "#126A91" : "#fff"} 
        />
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
});