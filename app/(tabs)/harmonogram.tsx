import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useState, useEffect, useMemo} from "react";
import {
  Medication,
} from '@/types/medication';
import {
  Shelf,
  ShelfItem,
} from '@/types/shelf';
import {
  DailySchedule,
} from '@/types/scheduler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

// Helper function to get the current week dates starting from Monday
const getCurrentWeekDates = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 (Nd) - 6 (Sb)
  const offset = currentDay === 0 ? -6 : 1 - currentDay; // przesunięcie do Poniedziałku

  const weekDates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset + i);
    weekDates.push(d);
  }

  return weekDates;
};

// Helper functions to get month names in Polish
const getPolishMonthName = (monthIndex: number): string => {
  const months = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];
  return months[monthIndex];
};

// Helper function to get month names in genitive case (used in dates)
const getPolishMonthNameGenitive = (monthIndex: number): string => {
  const months = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];
  return months[monthIndex];
};

export default function Harmonogram() {
const isFocused = useIsFocused();

// Date related state and functions
const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb', 'Nd'];
const weekDates = useMemo(() => getCurrentWeekDates(), []);
const [selectedDate, setSelectedDate] = useState(new Date().getDate());

// State for medications, shelf, and schedules
const [medications, setMedications] = useState<Medication[]>([]);
const [shelf, setShelf] = useState<Shelf>({ items: [] });
const [schedules, setSchedules] = useState<DailySchedule[]>([]);

// Fetch data from AsyncStorage when "Harmonogram" is focused or when the date changes
useEffect(() => {
  (async () => {
    try {

      const medsRaw = await AsyncStorage.getItem('medications');
      if (medsRaw !== null) {
        setMedications(JSON.parse(medsRaw));
      }

      const shelfRaw = await AsyncStorage.getItem('shelf');
      if (shelfRaw !== null) {
        setShelf(JSON.parse(shelfRaw));
      }

      const schedRaw = await AsyncStorage.getItem('schedules');
      if (schedRaw !== null) {
        const arr: DailySchedule[] = JSON.parse(schedRaw).map((s: any) => ({
          ...s,
          endDate: s.endDate ? new Date(s.endDate) : undefined,
          exceptions: s.exceptions
            ? (s.exceptions as string[]).map((d) => new Date(d))
            : undefined,
        }));
        setSchedules(arr);
      }
    } catch (e) {
      console.warn('Błąd przy wczytywaniu z AsyncStorage', e);
    }
  })();
}, [selectedDate, isFocused]);

// Render function for each medication item
  const renderItem = ({ item }: { item: Medication }) => {
    const shelfEntry = shelf.items.find((s) => s.medication_id === item.id);
    const quantity = shelfEntry?.quantity ?? 0;
    const schedule = schedules.find((s) => s.medication_id === item.id);
    const timeDisplay = schedule?.times?.join(', ') ?? '–';
    const dosageQuantity = 'value' in item.dosage ? item.dosage.value : 0;

    return (
      <View style={[styles.medContainer, { marginBottom: 5 }]}>
        <Text style={styles.medInfoTime}>{timeDisplay}</Text>
    
        <View style={styles.medRow}>
          <Text style={styles.medText}>
            {item.genericName}{item.brandName ? ` (${item.brandName})` : ''}
          </Text>
          <Text style={styles.medText}>
            {dosageQuantity} {dosageQuantity === 1 ? 'tabletka' : 'tabletek'}
          </Text>
        </View>
      </View>
    );
  };

// Main render function
  return (
    <View style={styles.container}>
      <Text style={styles.selectedDateLabel}>{getPolishMonthName(weekDates.find(date => date.getDate() === selectedDate)?.getMonth() ?? new Date().getMonth())}</Text>
      <View style={styles.dateRow}>
        {days.map((day, index) => {
          const date = weekDates[index].getDate();
          const isSelected = date === selectedDate;

          return (
            <TouchableOpacity
              key={date}
              style={[styles.dateItem, isSelected && styles.selectedDate]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>{day}</Text>
              <Text style={[styles.dateText, isSelected && styles.selectedText]}>{date}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.selectedDateLabel}>{selectedDate} {getPolishMonthNameGenitive(new Date().getMonth())}</Text>

      {medications.length === 0 ? (
        <Text style={styles.emptyText}>Brak lekow.</Text>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}

    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 16
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  },
  selectedDate: {
    backgroundColor: '#126A91',
  },
  dayText: {
    fontSize: 12,
    color: "white",
  },
  dateText: {
    fontSize: 16,
    color: "white",
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  selectedDateLabel: {
    fontSize: 18,
    color: "white",
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  medContainer: {
    padding: 10,
    marginBottom: 10,
  },
  medRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // oddala na maxa
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 40,
    marginBottom: 12,
  },
  medTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  medInfoTime: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  medBadge: {
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 40,
    textAlign: 'center',
    padding: 4,
    marginBottom: 5
  },
  medBadgeDanger: {
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 40,
    backgroundColor: 'red',
    textAlign: 'center',
    padding: 4,
    marginBottom: 5
  }
});
