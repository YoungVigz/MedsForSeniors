import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {

  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />

        <Tabs.Screen
            name="index"
            options={{
            title: 'About',
            }}
        />
    </Tabs>
  );
}
