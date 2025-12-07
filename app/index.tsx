import { ImageBackground } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', paddingTop: 100 }} > 
        <ImageBackground
          source={require('../assets/images/Logo.png')}
          style={{ width: 350, height: 350, justifyContent: 'flex-start', alignItems: 'center' }}
          contentFit="contain"
          >
          <Text style={styles.logoText}>Just A Deck Of Cards</Text>
        </ImageBackground>
      </View>
      <View
        style={styles.container}
      >
        <Link href="/create" asChild> 
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Create Game</Text>
          </Pressable>
        </Link>
        <Link href="/join" asChild> 
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Join Game</Text>
          </Pressable>
        </Link>
        <Link href="/rulebook" asChild> 
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Rulebook</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 25,
    padding: 20,
  },
  button: {
    backgroundColor: '#000000ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 
    minWidth: 200, 
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 0,
    marginBottom: 100,
  },
});