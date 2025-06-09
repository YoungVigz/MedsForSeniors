import { StyleSheet, Text, View, Button, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { AppText } from "@/components/AppText";

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

export default function Leki() {
  //const { drugs } = useLocalSearchParams(); kiedy apteczka bedzie zbudowana
  const [drugs, setDrugs] = useState(intialDrugs);
  const handleDrugTaken = (id: string) => {
    setDrugs((prevDrugs) => prevDrugs.filter((drug) => drug.id !== id));
  };

  const today = new Date();
  const dayName = today.toLocaleDateString("pl-PL", { weekday: "long" });
  const dayOfTheMonth = today.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
  });

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
    <ScrollView style={styles.container}>
      <View style={styles.dateContainer}>
        <AppText style={styles.month} baseSize={22}>{dayOfTheMonth}</AppText>
        <AppText style={styles.day} baseSize={18}>{dayName}</AppText>
      </View>

      {drugs.length === 0 ? (
        <AppText style={styles.emptyMessage} baseSize={16}>Wszystkie zostały przyjęte</AppText>
      ) : (
        drugs.map((drug) => (
          <View key={drug.id} style={styles.drugListContainer}>
            <View
              style={[
                styles.timeBox,
                isLate(drug.doseTime) && styles.timeBoxLate,
              ]}
            >
              <AppText style={styles.timeText} baseSize={16}>{drug.doseTime}</AppText>
            </View>

            <View style={styles.drugListItem}>
              <View style={styles.drugListTop}>
                <AppText style={styles.drugName} baseSize={18}>{drug.name}</AppText>
                <AppText style={styles.drugAmount} baseSize={16}>{drug.amount}</AppText>
              </View>

              <View style={styles.drugListBottom}>
                <Button title="Przyjęte" onPress={() => handleDrugTaken(drug.id)} />
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
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
    //fontSize: 22,
  },
  day: {
    color: "#aaa",
    //fontSize: 18,
    marginTop: 4,
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
