import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { DogCard } from '../components/DogCard';
import { mockDogs, Dog } from '../data/mockDogs';
import { useApp } from '../context/AppContext';

export default function HomeScreen() {
  const { userDog } = useApp();
  const [dogs, setDogs] = useState<Dog[]>(mockDogs);

  const handleLike = (id: string) => {
    setDogs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, liked: !d.liked } : d))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            היי{userDog.name ? `, ${userDog.name}` : ''}! 👋
          </Text>
          <Text style={styles.subtitle}>מי רוצה לצאת היום?</Text>
        </View>
        <Text style={styles.locationBadge}>📍 Tel Aviv</Text>
      </View>
      <FlatList
        data={dogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DogCard dog={item} onLike={handleLike} liked={item.liked} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3561',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  locationBadge: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '600',
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  list: {
    paddingBottom: 24,
    paddingTop: 4,
  },
});
