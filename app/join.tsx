import AppButton from '@/componets/AppButton';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Join() {
  const [code, setCode] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <View style={styles.topContainer}>
        <Image
          source={require('../assets/images/key.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Einladungscode eingeben</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Code eingeben"
          placeholderTextColor="#888"
          value={code}
          onChangeText={setCode}
        />
      </View>

      <View style={styles.buttonContainer}>
        <AppButton title="Spiel beitreten" onPress={() => router.push("/join")} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  topContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  image: {
    width: 250,
    height: 250,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  input: {
    width: '80%',
    height: 45,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#000',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
});
