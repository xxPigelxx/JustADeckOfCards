import React, { useState } from 'react';
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type SlideItem = {
  id: string;
  title: string;
  imageSource: any;
  description: string;
};

const SLIDES: SlideItem[] = [
  {
    id: '1',
    title: 'Karte ausspielen',
    imageSource: require('../assets/images/hold-and-drag.png'),
    description: 'Um eine Karte auszuspielen, tippe sie an, halte den Finger darauf und ziehe sie an die gewünschte Position (Drag & Drop). Lasse los, um sie abzulegen.',
  },
  {
    id: '2',
    title: 'Karten-Optionen',
    imageSource: require('../assets/images/tap.png'),
    description: 'Ein Tippen auf eine Karte oder einen Stapel öffnet das Aktionsmenü. Hier kannst du Karten umdrehen, den Stapel mischen oder die Reihenfolge umkehren.',
  },
];

function Controls() {
  const [activeIndex, setActiveIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: SlideItem }) => {
    return (
      <View style={styles.slide}>
        {/* Inhalt */}
        <View style={styles.imageContainer}>
          <Image
            source={item.imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={StyleSheet.absoluteFill}
      />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function Gestures() {
  return (
    <SafeAreaProvider>
      <Controls />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#fff',
  },
  slide: {
    width: width,
    height: height,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 150,
  },
  imageContainer: {
    width: 200,
    height: 250,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: 'transparent',
    elevation: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 30,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: '#444',
  },
  dotInactive: {
    backgroundColor: '#CCC',
  }
});
