import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TagChip } from '../components/TagChip';
import { useApp } from '../context/AppContext';
import { Personality } from '../data/mockDogs';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const BREEDS = [
  'Golden Retriever', 'Labrador', 'German Shepherd', 'French Bulldog',
  'Poodle', 'Beagle', 'Border Collie', 'Husky', 'Bulldog', 'Chihuahua',
  'Rottweiler', 'Shih Tzu', 'Mixed Breed', 'Other',
];

const PERSONALITIES: Personality[] = ['Friendly', 'Playful', 'Calm', 'Energetic', 'Shy', 'Protective'];

export default function OnboardingScreen({ navigation }: Props) {
  const { setUserDog, completeOnboarding } = useApp();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [selectedPersonality, setSelectedPersonality] = useState<Personality[]>([]);
  const [showBreedPicker, setShowBreedPicker] = useState(false);

  const togglePersonality = (tag: Personality) => {
    setSelectedPersonality((prev) =>
      prev.includes(tag) ? prev.filter((p) => p !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter your dog\'s name 🐾');
      return;
    }
    if (!breed) {
      Alert.alert('Missing Info', 'Please select your dog\'s breed');
      return;
    }
    setUserDog({ name: name.trim(), breed, age, gender, personality: selectedPersonality });
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.dogAvatar}>🐕</Text>
          <Text style={styles.title}>Tell us about{'\n'}your dog!</Text>
          <Text style={styles.subtitle}>We'll find the perfect playmates nearby 🐾</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Dog's Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Max, Bella, Rocky..."
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Breed</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowBreedPicker(!showBreedPicker)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pickerText, !breed && styles.placeholder]}>
              {breed || 'Select breed...'}
            </Text>
            <Text>{showBreedPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showBreedPicker && (
            <View style={styles.dropdownList}>
              {BREEDS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.dropdownItem, breed === b && styles.dropdownItemSelected]}
                  onPress={() => { setBreed(b); setShowBreedPicker(false); }}
                >
                  <Text style={[styles.dropdownText, breed === b && styles.dropdownTextSelected]}>
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Age (years)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2"
            placeholderTextColor="#bbb"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
              onPress={() => setGender('Male')}
              activeOpacity={0.7}
            >
              <Text style={[styles.genderBtnText, gender === 'Male' && styles.genderBtnTextActive]}>
                🐶 Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
              onPress={() => setGender('Female')}
              activeOpacity={0.7}
            >
              <Text style={[styles.genderBtnText, gender === 'Female' && styles.genderBtnTextActive]}>
                🐩 Female
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Personality</Text>
          <Text style={styles.sublabel}>Pick all that apply</Text>
          <View style={styles.tags}>
            {PERSONALITIES.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                selected={selectedPersonality.includes(tag)}
                onPress={() => togglePersonality(tag)}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Let's go! 🐾</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  dogAvatar: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2D3561',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3561',
    marginBottom: 6,
    marginTop: 16,
  },
  sublabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 10,
    marginTop: -4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2D3561',
    backgroundColor: '#fff',
  },
  picker: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 15,
    color: '#2D3561',
  },
  placeholder: {
    color: '#bbb',
  },
  dropdownList: {
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginTop: 4,
    maxHeight: 200,
    overflow: 'scroll',
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#FFF5F2',
  },
  dropdownText: {
    fontSize: 15,
    color: '#2D3561',
  },
  dropdownTextSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  genderBtnActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F2',
  },
  genderBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  genderBtnTextActive: {
    color: '#FF6B35',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 24,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
