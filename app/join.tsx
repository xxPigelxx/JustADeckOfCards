import AppButton from '@/componets/AppButton';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Join() {
  const [code, setCode] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>

      <Image
        source={require('../assets/images/key.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Einladungscode eingeben</Text>

      <TextInput
        style={styles.input}
        placeholder="Code eingeben"
        placeholderTextColor="#888"
        value={code}
        onChangeText={setCode}
        textAlign="center"
      />

      <AppButton
        title="Spiel beitreten"
        onPress={() => router.push("/join")}
        style={styles.button}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 10,
  },
  input: {
    width: '80%',
    height: 45,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 30,
    width: '80%',
  },
});
