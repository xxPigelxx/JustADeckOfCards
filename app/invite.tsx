import AppButton from '@/componets/AppButton';
import BurgerMenu from '@/componets/BurgerMenu';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Invite() {
  const [code, setCode] = useState('123456');
  const router = useRouter();

  return (
    <View style={styles.container}>

      <Image
        source={require('../assets/images/key.png')}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Einladungscode</Text>

      <View style={styles.codeField}>
        <Text style={styles.codeText}>{code}</Text>
      </View>

      <AppButton
        title="Spiel starten"
        onPress={() => router.push("/gameScreen")}
        style={styles.button}
      />
      <BurgerMenu />
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
  codeField: {
    width: '80%',
    height: 45,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 30,
  },
  codeText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    marginTop:30,
  },
});
