import React, { useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Alert,
  FlatList,
  Platform,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { SettingsContext } from '@/context/SettingsContext';
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

export default function Apteczka() {

  // ---------------------------------------
  // Kontekst Senior Mode
  // ---------------------------------------
  const { isSeniorMode } = useContext(SettingsContext);

  // ---------------------------------------
  // Lokalny stan:
  //    a) lista wszystkich leków (Medication[])
  //    b) „szafka” = shelf (Shelf, czyli { items: ShelfItem[] })
  //    c) tablica jednodniowych harmonogramów (DailySchedule[])
  // ---------------------------------------
  const [medications, setMedications] = useState<Medication[]>([]);
  const [shelf, setShelf] = useState<Shelf>({ items: [] });
  const [schedules, setSchedules] = useState<DailySchedule[]>([]);

  // ---------------------------------------
  // Stany formularza dodawania nowego leku:
  //    - newMedName: nazwa generyczna
  //    - newBrandName: nazwa marki (opcjonalnie)
  //    - newDosageValue: ilość dawkowania jako string (później parseFloat)
  //    - newQuantity: ilość leku w „szafce” (string → parsujemy do number)
  //    - newDateTime: obiekt Date wybrany w DateTimePicker
  //    - showDatePicker: flaga, czy pokazać DateTimePicker
  // ---------------------------------------
  const [newMedName, setNewMedName] = useState<string>('');  
  const [newBrandName, setNewBrandName] = useState<string>('');      
  const [newDosageValue, setNewDosageValue] = useState<string>(''); 
  const [newQuantity, setNewQuantity] = useState<string>('');        
  const [newDateTime, setNewDateTime] = useState<Date>(new Date()); 
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // ---------------------------------------
  // Ładowanie z AsyncStorage (medications, shelf, schedules)
  // ---------------------------------------
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
  }, []);

  // ---------------------------------------
  // Obsługa zmiany daty/godziny w DateTimePicker
  // ---------------------------------------
  const onChangeDateTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewDateTime(selectedDate);
    }
  };

  // ---------------------------------------
  // Funkcja, która dodaje nowy lek:
  //    - zapisuje nowy obiekt Medication do `medications`
  //    - tworzy ShelfItem i zapisuje w `shelf`
  //    - tworzy DailySchedule i zapisuje w `schedules`
  // ---------------------------------------

  const addMedication = async () => {
    if (newMedName.trim().length === 0) {
      Alert.alert('Błąd', 'Nazwa leku nie może być pusta.');
      return;
    }

    const parsedDosage = parseInt(newDosageValue, 10);
    if (isNaN(parsedDosage) || parsedDosage <= 0) {
      Alert.alert('Błąd', 'Podaj prawidłową ilość tabletek na dobę (>= 1).');
      return;
    }
    const parsedQuantity = parseInt(newQuantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      Alert.alert('Błąd', 'Podaj prawidłową ilość tabletek w apteczce (>= 0).');
      return;
    }

    const newMedId = Date.now().toString();
    const newMed: Medication<'Tablets'> = {
      id: newMedId,
      genericName: newMedName.trim(),
      ...(newBrandName.trim().length > 0 ? { brandName: newBrandName.trim() } : {}),
      type: 'Tablets',
      dosage: { unit: 'pieces', value: parsedDosage },
    };

    const updatedMeds = [...medications, newMed];
    setMedications(updatedMeds);
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMeds));
    } catch (e) {
      console.warn('Błąd przy zapisie medications', e);
    }

    const newShelfItem: ShelfItem = {
      medication_id: newMedId,
      quantity: parsedQuantity,
    };
    const updatedShelf: Shelf = {
      items: [...shelf.items, newShelfItem],
    };
    setShelf(updatedShelf);
    try {
      await AsyncStorage.setItem('shelf', JSON.stringify(updatedShelf));
    } catch (e) {
      console.warn('Błąd przy zapisie shelf', e);
    }

    const hours = newDateTime.getHours().toString().padStart(2, '0');
    const minutes = newDateTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const newSchedule: DailySchedule = {
      medication_id: newMedId,
      frequency: 'daily',
      timesInDay: 1,
      times: [timeString],
    };
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    try {
      const toStore = updatedSchedules.map((s) => ({
        ...s,
        endDate: s.endDate ? s.endDate.toISOString() : undefined,
        exceptions: s.exceptions
          ? s.exceptions.map((d) => d.toISOString())
          : undefined,
      }));
      await AsyncStorage.setItem('schedules', JSON.stringify(toStore));
    } catch (e) {
      console.warn('Błąd przy zapisie schedules', e);
    }

    setNewMedName('');
    setNewBrandName('');
    setNewDosageValue('');
    setNewQuantity('');
    setNewDateTime(new Date());
    setShowDatePicker(false);
  };

  // ---------------------------------------
  // Funkcja, która usuwa wybrany lek (usuwa go z listy leków, schedula i apteczki):
  // ---------------------------------------
  const deleteMedication = async (medId: string) => {
    const filteredMeds = medications.filter((m) => m.id !== medId);
    setMedications(filteredMeds);
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(filteredMeds));
    } catch (e) {
      console.warn('Błąd przy usuwaniu z medications', e);
    }

    const filteredShelfItems = shelf.items.filter((si) => si.medication_id !== medId);
    const updatedShelf: Shelf = { items: filteredShelfItems };
    setShelf(updatedShelf);
    try {
      await AsyncStorage.setItem('shelf', JSON.stringify(updatedShelf));
    } catch (e) {
      console.warn('Błąd przy usuwaniu z shelf', e);
    }

    const filteredSchedules = schedules.filter((sch) => sch.medication_id !== medId);
    setSchedules(filteredSchedules);
    try {
      const toStore = filteredSchedules.map((s) => ({
        ...s,
        endDate: s.endDate ? s.endDate.toISOString() : undefined,
        exceptions: s.exceptions
          ? s.exceptions.map((d) => d.toISOString())
          : undefined,
      }));
      await AsyncStorage.setItem('schedules', JSON.stringify(toStore));
    } catch (e) {
      console.warn('Błąd przy usuwaniu z schedules', e);
    }
  };

  // ---------------------------------------
  // Render pojedynczego leku w liście:
  // ---------------------------------------
  const renderItem = ({ item }: { item: Medication }) => {
    const shelfEntry = shelf.items.find((si) => si.medication_id === item.id);
    const quantity = shelfEntry ? shelfEntry.quantity : 0;

    const scheduleEntry = schedules.find((sch) => sch.medication_id === item.id);
    const timeDisplay =
      scheduleEntry && scheduleEntry.times.length > 0
        ? scheduleEntry.times.join(', ')
        : '–';

    const dosageQuantity = 'value' in item.dosage ? item.dosage.value : 0;

    return (
      <View style={styles.medRow}>

        {/*Tutaj jest nazwa leku i opcje do usuwania*/}
        <View style={styles.medTitle}>
          <Text style={styles.medText}>
            {item.genericName}
            {item.brandName ? ` (${item.brandName})` : ''}
          </Text>

          {isSeniorMode && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Usuń lek',
                    'Czy na pewno chcesz usunąć ten lek?',
                    [
                      { text: 'Anuluj', style: 'cancel' },
                      {
                        text: 'Tak, usuń',
                        style: 'destructive',
                        onPress: () => deleteMedication(item.id),
                      },
                    ]
                  )
                }
              >
                <Text style={styles.medText}>Usuń</Text>
              </TouchableOpacity>
          )}
        </View>

        {/*Tutaj są informacje o leku*/}
        <View style={styles.medInfoContainer}>
          <View>
            <Text style={styles.medInfo}>Przyjmowanie</Text>

            <Text style={styles.medBadge}>
              {timeDisplay}
            </Text>

            <Text style={styles.medBadge}>
              codziennie
            </Text>

            <Text style={styles.medBadge}>
              {dosageQuantity} {dosageQuantity === 1 ? 'tabletka' : 'tabletek'}
            </Text>
          </View>


          <View>
            <Text style={styles.medInfo}>Zostało</Text>
            <Text style={(quantity - (dosageQuantity * 3 )) < 0 ? styles.medBadgeDanger : styles.medBadge}>
              {quantity} {quantity === 1 ? 'tabletka' : 'tabletek'}
            </Text>
          </View>
        </View>

      </View>
    );
  };

 return (
    <View style={styles.container}>
      {/* FORMULARZ dodawania – widoczny tylko, gdy isSeniorMode === true  */}
      {isSeniorMode && (
        <>
          {/* Pole nazwa leku */}
          <TextInput
            style={styles.input}
            placeholder="Nazwa leku"
            placeholderTextColor="#aaa"
            value={newMedName}
            onChangeText={setNewMedName}
          />
          {/* Pole na marke */}
          <TextInput
            style={styles.input}
            placeholder="Marka (opcjonalnie)"
            placeholderTextColor="#aaa"
            value={newBrandName}
            onChangeText={setNewBrandName}
          />

          {/* Pole dawkowania (ilość tabletek dziennie) */}
          <TextInput
            style={styles.input}
            placeholder="Dawkowanie (ile tabletek dziennie)"
            placeholderTextColor="#aaa"
            value={newDosageValue}
            onChangeText={setNewDosageValue}
            keyboardType="numeric"
          />

          {/* Pole ilości w apteczce */}
          <TextInput
            style={styles.input}
            placeholder="Ilość tabletek które zostały"
            placeholderTextColor="#aaa"
            value={newQuantity}
            onChangeText={setNewQuantity}
            keyboardType="numeric"
          />

          {/* Wybór godziny przyjęcia */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.datePickerButtonText}>
              Godzina przyjmowania leku: {newDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={newDateTime}
              mode="time"
              display="default"
              onChange={onChangeDateTime}
            />
          )}

          {/* Przycisk „Dodaj lek” */}
          <View style={styles.buttonWrapper}>
            <Button title="Dodaj lek" onPress={addMedication} color="#126A91" />
          </View>
        </>
      )}

      {/* 9. LISTA LEKÓW. Jeśli brak, wyświetlamy komunikat */}
      {medications.length === 0 ? (
        <Text style={styles.emptyText}>Brak leków w szafce.</Text>
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

// --- Style ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 16,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  datePickerButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  datePickerButtonText: {
    color: '#fff',
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 40,
  },
  medRow: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 40,
    marginBottom: 12,
  },
  medTitle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  medText: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 16,
  },
  medInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  medInfo: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
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