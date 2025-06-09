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
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { AppText } from "@/components/AppText";


export default function Apteczka() {
  const isFocused = useIsFocused();

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
  // Stany do edycji leku:
  //    - editingMedId: Id aktualnie edytowanego leku
  //    - isEditModalVisible: sprawdzenie czy coś jest edytowane
  // ---------------------------------------
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

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
  }, [isFocused]);

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
  // Funkcja, typu helper:
  // resetuje wartości dla formularzy 
  // ---------------------------------------
  const resetForm = () => {
    setNewMedName('');
    setNewBrandName('');
    setNewDosageValue('');
    setNewQuantity('');
    setNewDateTime(new Date());
    setEditingMedId(null);
  };

  // ---------------------------------------
  // Funkcja, która dodaje nowy lek:
  //    - zapisuje nowy obiekt Medication do `medications`
  //    - tworzy ShelfItem i zapisuje w `shelf`
  //    - tworzy DailySchedule i zapisuje w `schedules`
  // ---------------------------------------
  const addOrUpdateMedication = async () => {
    if (newMedName.trim() === '' || isNaN(Number(newDosageValue)) || isNaN(Number(newQuantity))) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola prawidłowo.');
      return;
    }

    const dosageValue = parseInt(newDosageValue, 10);
    const quantityValue = parseInt(newQuantity, 10);
    const timeStr = newDateTime.toTimeString().slice(0, 5);

    if (editingMedId) {
      // Update existing
      const updatedMeds: Medication[] = medications.map((med) =>
        med.id === editingMedId
          ? {
              ...med,
              genericName: newMedName.trim(),
              brandName: newBrandName.trim() || undefined,
              dosage: { unit: 'pieces', value: dosageValue },
            }
          : med
      );
      setMedications(updatedMeds);
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMeds));

      const updatedShelf: Shelf = {
        items: shelf.items.map((item) =>
          item.medication_id === editingMedId
            ? { ...item, quantity: quantityValue }
            : item
        ),
      };
      setShelf(updatedShelf);
      await AsyncStorage.setItem('shelf', JSON.stringify(updatedShelf));

      const updatedSchedules: DailySchedule[] = schedules.map((sch) =>
        sch.medication_id === editingMedId
          ? { ...sch, times: [timeStr] }
          : sch
      );
      setSchedules(updatedSchedules);
      await AsyncStorage.setItem(
        'schedules',
        JSON.stringify(
          updatedSchedules.map((s) => ({
            ...s,
            endDate: s.endDate?.toISOString(),
            exceptions: s.exceptions?.map((d: Date) => d.toISOString()),
          }))
        )
      );
    } else {
      // Add new
      const newMedId = Date.now().toString();
      const newMed: Medication<'Tablets'> = {
        id: newMedId,
        genericName: newMedName.trim(),
        brandName: newBrandName.trim() || undefined,
        type: 'Tablets',
        dosage: { unit: 'pieces', value: dosageValue },
      };
      const updatedMeds = [...medications, newMed];
      setMedications(updatedMeds);
      await AsyncStorage.setItem('medications', JSON.stringify(updatedMeds));

      const newShelfItem: ShelfItem = { medication_id: newMedId, quantity: quantityValue };
      const updatedShelf: Shelf = { items: [...shelf.items, newShelfItem] };
      setShelf(updatedShelf);
      await AsyncStorage.setItem('shelf', JSON.stringify(updatedShelf));

      const newSchedule: DailySchedule = {
        medication_id: newMedId,
        frequency: 'daily',
        timesInDay: dosageValue,
        times: [timeStr],
      };
      const updatedSchedules = [...schedules, newSchedule];
      setSchedules(updatedSchedules);
      await AsyncStorage.setItem(
        'schedules',
        JSON.stringify(
          updatedSchedules.map((s) => ({
            ...s,
            endDate: s.endDate?.toISOString(),
            exceptions: s.exceptions?.map((d: Date) => d.toISOString()),
          }))
        )
      );
    }

    resetForm();
    setIsEditModalVisible(false);
  };

  // ---------------------------------------
  // Funkcja, która wprowadza dane leku do formularza
  // ---------------------------------------
  const startEditMedication = (medId: string) => {
    const med = medications.find((m) => m.id === medId);
    if (!med) return;
    const shelfItem = shelf.items.find((i) => i.medication_id === medId);
    const schedule = schedules.find((s) => s.medication_id === medId);

    setNewMedName(med.genericName);
    setNewBrandName(med.brandName || '');
    setNewDosageValue('value' in med.dosage ? med.dosage.value.toString(): "0");
    setNewQuantity((shelfItem?.quantity || 0).toString());
    if (schedule?.times?.[0]) {
      const [h, m] = schedule.times[0].split(':');
      const date = new Date();
      date.setHours(parseInt(h));
      date.setMinutes(parseInt(m));
      setNewDateTime(date);
    }
    setEditingMedId(medId);
    setIsEditModalVisible(true);
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
    const shelfEntry = shelf.items.find((s) => s.medication_id === item.id);
    const quantity = shelfEntry?.quantity ?? 0;
    const schedule = schedules.find((s) => s.medication_id === item.id);
    const timeDisplay = schedule?.times?.join(', ') ?? '–';
    const dosageQuantity = 'value' in item.dosage ? item.dosage.value : 0;

    return (
  <View style={styles.medRow}>
    <View style={styles.medTitle}>
      <AppText baseSize={18} style={styles.medText}>
        {item.genericName}{item.brandName ? ` (${item.brandName})` : ''}
      </AppText>
      {isSeniorMode && (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => startEditMedication(item.id)}>
            <Ionicons
              name="create-outline"
              size={30}
              color={item.id === editingMedId ? "#0e86d4" : "#fff"}
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Usuń lek', 'Czy na pewno?', [
                { text: 'Anuluj', style: 'cancel' },
                { text: 'Tak', onPress: () => deleteMedication(item.id), style: 'destructive' },
              ])
            }
          >
            <Ionicons name="close-circle-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
    <View style={styles.medInfoContainer}>
      <View>
        <AppText baseSize={16} style={styles.medInfo}>Przyjmowanie</AppText>
        <AppText baseSize={16} style={styles.medBadge}>{timeDisplay}</AppText>
        <AppText baseSize={16} style={styles.medBadge}>codziennie</AppText>
        <AppText baseSize={16} style={styles.medBadge}>
          {dosageQuantity} {dosageQuantity === 1 ? 'tabletka' : 'tabletek'}
        </AppText>
      </View>
      <View>
        <AppText baseSize={16} style={styles.medInfo}>Zostało</AppText>
        <AppText
          baseSize={16}
          style={(quantity - dosageQuantity * 3) < 0 ? styles.medBadgeDanger : styles.medBadge}
        >
          {quantity} {quantity === 1 ? 'tabletka' : 'tabletek'}
        </AppText>
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
          <AppText baseSize={16} style={styles.datePickerButtonText}>
            Godzina przyjmowania leku: {newDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </AppText>
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
          <TouchableOpacity
            onPress={addOrUpdateMedication}
            style={styles.button}
          >
            <AppText baseSize={18} style={styles.buttonText}>
              {isEditModalVisible ? "Aktualizuj Lek" : "Dodaj Lek"}
            </AppText>
          </TouchableOpacity>
        </View>
      </>
    )}

    {/* 9. LISTA LEKÓW. Jeśli brak, wyświetlamy komunikat */}
    {medications.length === 0 ? (
      <AppText baseSize={16} style={styles.emptyText}>Brak leków w szafce.</AppText>
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
    fontSize: 16,
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0e86d4',
    padding: 10,
    borderRadius: 20
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
    color: "white"
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
    //fontSize: 20,
    marginBottom: 16,
  },
  medInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  medInfo: {
    color: '#ccc',
    //fontSize: 14,
    marginBottom: 4,
  },
  medBadge: {
    color: '#fff',
    //fontSize: 14,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 40,
    textAlign: 'center',
    padding: 4,
    marginBottom: 5
  },
  medBadgeDanger: {
    color: '#fff',
    //fontSize: 14,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 40,
    backgroundColor: 'red',
    textAlign: 'center',
    padding: 4,
    marginBottom: 5
  }
});