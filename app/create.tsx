import AppButton from "@/componets/AppButton";
import BurgerMenu from "@/componets/BurgerMenu";
import CustomSlider from "@/componets/Slider";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Create() {

  const [selected, setSelected] = useState<number | null>(null);
  const [players, setPlayers] = useState(0);

  const options = ["54 Karten", "52 Karten", "36 Karten", "32 Karten", "24 Karten"];

  return (
    <View style={styles.toggleContainer}>
      <Text style={styles.heading}>Kartendecktyp</Text>
      <View style={styles.toggleGroup}>
        {options.map((title, index) => {
          const isActive = selected === index;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelected(index)}
              style={[
                styles.toggleButton,
                isActive && styles.toggleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  isActive && styles.toggleTextActive,
                ]}
              >
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    
    <View style={styles.sliderContainer}>
        <Text style={styles.heading}>Anzahl der Decks</Text>
        <CustomSlider value={players} onChange={setPlayers} />  
      </View>    

    <View style={styles.sliderContainer}>
        <Text style={styles.heading}>Anzahl Spieler</Text>
        <CustomSlider value={players} onChange={setPlayers} /> 
      </View>        
    
    <View style={styles.sliderContainer}>
        <Text style={styles.heading}>Anzahl Handkarten</Text>
        <CustomSlider value={players} onChange={setPlayers} /> 
      </View>     
    
     <AppButton
            title="Spielcode teilen"
            onPress={() => router.push("/invite")}
            style={styles.button}
          />
      <BurgerMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 20,
    gap: 20,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "left",
    width: "100%",
  },

  toggleGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 15,
  },

  toggleButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: "#E9E9E9",
    alignItems: "center",
  },

  toggleButtonActive: {
    backgroundColor: "#f1ce5bff",
  },

  toggleText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },

  toggleTextActive: {
    color: "#000000ff",
  },

  button: {
    marginTop: 40,
    alignItems: 'center',
  },

  sliderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },

});
