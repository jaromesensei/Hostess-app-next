import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Dog } from '../data/mockDogs';
import { TagChip } from './TagChip';

interface DogCardProps {
  dog: Dog;
  onLike?: (id: string) => void;
  liked?: boolean;
}

export function DogCard({ dog, onLike, liked = false }: DogCardProps) {
  const [isLiked, setIsLiked] = useState(liked);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(dog.id);
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: dog.photo }} style={styles.photo} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{dog.name}</Text>
            <Text style={styles.breed}>{dog.breed} · {dog.age}y · {dog.gender}</Text>
          </View>
          <TouchableOpacity onPress={handleLike} style={styles.heartBtn} activeOpacity={0.7}>
            <Text style={styles.heart}>{isLiked ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.distanceRow}>
          <Text style={styles.distance}>📍 {dog.distance}</Text>
          <Text style={styles.owner}>Owner: {dog.ownerName}</Text>
        </View>
        <View style={styles.tags}>
          {dog.personality.map((tag) => (
            <TagChip key={tag} label={tag} selected />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  photo: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3561',
  },
  breed: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  heartBtn: {
    padding: 4,
  },
  heart: {
    fontSize: 24,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  distance: {
    fontSize: 13,
    color: '#888',
  },
  owner: {
    fontSize: 13,
    color: '#888',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
