import { StyleSheet, Text, View, Button, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

// tymczasowe dopoki apteczka ni bedzie zbudowana
const intialDrugs = [
  {
    id: "0",
    name: "Paracetamol",
    amount: "1 tabletka",
    doseFrequency: "codziennie",
    doseTime: "9:00",
  },
  {
    id: "1",
    name: "Ibuprofen",
    amount: "1 kapsułka",
    doseFrequency: "co 8 godzin",
    doseTime: "13:00",
  },
  {
    id: "2",
    name: "Amoksycylina",
    amount: "1 tabletka",
    doseFrequency: "co 12 godzin",
    doseTime: "20:00",
  },
  {
    id: "3",
    name: "Rutinoscorbin",
    amount: "2 tabletki",
    doseFrequency: "codziennie",
    doseTime: "7:30",
  },
];

type MedForToday = {
  id: string,
  name: string,
  amount: number,
  doseTime: string
}

export default function Leki() {
  const isFocused = useIsFocused();
  const [drugs, setDrugs] = useState<MedForToday[]>([]);

  const [userName, setUserName] = useState<string>("");
  const [debug, setDebug] = useState<string>("");

  const handleDrugTaken = async (id: string, dosege: number) => {
    setDrugs((prevDrugs) => prevDrugs.filter((drug) => drug.id !== id));

    const day = today.toISOString().substring(0, 10);
    const newList = drugs.filter((d) => d.id !== id);
    await AsyncStorage.setItem(day, JSON.stringify(newList))

    const shelfRaw = await AsyncStorage.getItem("shelf")
    if(!shelfRaw) return;

    const shelf = JSON.parse(shelfRaw).items
    shelf.forEach((s: any) => {
      if(s.medication_id == id) {
        s.quantity -= dosege
      }
    });

    const newShelf = {
      "items": shelf
    }

    await AsyncStorage.setItem("shelf", JSON.stringify(newShelf))
  };

  const today = new Date();
  const dayName = today.toLocaleDateString("pl-PL", { weekday: "long" });
  const dayOfTheMonth = today.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    const setName = async () => {

      const name = await AsyncStorage.getItem("userName");

      if(typeof name == "string") {
        setUserName(name)
      } else {
        setUserName("Użytkownik")
      }
    }

    const setMedicines = async () => {

      const day = today.toISOString().substring(0, 10);
      const drugs: string | null = await AsyncStorage.getItem(day)

      if(!drugs) {
        const scheduleRaw = await AsyncStorage.getItem("schedules")
        const medicationsRaw = await AsyncStorage.getItem("medications")

        const medsForToday: MedForToday[] = []

        if(!scheduleRaw || !medicationsRaw) return;

        const schedule = JSON.parse(scheduleRaw)
        const medications = JSON.parse(medicationsRaw)

        schedule.forEach((sch: any) => {
          let med: MedForToday = {
            id: "",
            amount: 0,
            doseTime: "",
            name: "" 
          }

          med.id = sch.medication_id
          med.amount = sch.timesInDay
          med.doseTime = sch.times[0]

          medications.forEach((medi: any) => {
            if(medi.id === med.id) {
              med.name = medi.genericName
            }
          });

          medsForToday.push(med)
        });

        await AsyncStorage.setItem(day, JSON.stringify(medsForToday))
      }


      let drugListRaw = await AsyncStorage.getItem(day)
      if(!drugListRaw) return;

      let meds: MedForToday[] = JSON.parse(drugListRaw)
      setDrugs(meds)
    }


    setName()
    setMedicines()
  }, [isFocused])



  const isLate = (doseTime: string): boolean => {
    const now = new Date();

    const [hour, minute] = doseTime.split(":").map(Number);
    const doseDate = new Date();
    doseDate.setHours(hour);
    doseDate.setMinutes(minute);
    doseDate.setSeconds(0);

    return now > doseDate;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.month}>Witaj {userName}! {debug}</Text>
      <View style={styles.dateContainer}>
        <AppText style={styles.month} baseSize={22}>{dayOfTheMonth}</AppText>
        <AppText style={styles.day} baseSize={18}>{dayName}</AppText>
      </View>

      <ScrollView>
        {drugs.length === 0 ? ( // jeśli lista leków na dziś się skończyła
          <Text style={styles.emptyMessage}>Wszystkie zostały przyjęte</Text>
        ) : (
          drugs.map(
            (
              drug // renderuj kontener leku na stronie
            ) => (
              <View key={drug.id} style={styles.drugListContainer}>
                <View
                  style={[
                    styles.timeBox,
                    isLate(drug.doseTime) && styles.timeBoxLate, // zmień tło godziny przyjęcia na czerwony, jeśli nie został przyjęty
                  ]}
                >
                  <Text style={styles.timeText}>{drug.doseTime}</Text>
                </View>

                <View style={styles.drugListItem}>
                  <View style={styles.drugListTop}>
                    <Text style={styles.drugName}>{drug.name}</Text>
                    <Text style={styles.drugAmount}>{drug.amount} tabletka</Text>
                  </View>

                  <View style={styles.drugListBottom}>
                    <Button
                      title="Przyjęte"
                      onPress={() => handleDrugTaken(drug.id, drug.amount)}
                    />
                  </View>
                </View>
              </View>
            )
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 16,
  },
  dateContainer: {
    marginBottom: 24,
  },
  month: {
    color: "white",
    fontSize: 22,
    marginBottom: 5
  },
  day: {
    color: "#aaa",
    fontSize: 18,
  },
  drugListContainer: {
    marginBottom: 20,
  },
  timeText: {
    color: "#bbb",
    //fontSize: 16,
    marginBottom: 6,
  },
  drugListItem: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
  },
  drugListTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  drugName: {
    color: "white",
    //fontSize: 18,
  },
  drugAmount: {
    color: "white",
    //fontSize: 16,
  },
  drugListBottom: {
    alignItems: "center",
  },
  emptyMessage: {
    color: "#aaa",
    textAlign: "center",
    //fontSize: 16,
    marginTop: 40,
  },
  timeBox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#444",
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  timeBoxLate: {
    backgroundColor: "#aa0000",
  },
});
