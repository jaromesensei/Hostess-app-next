import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  FlatList,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';
import { WButton } from '@/components/ui/Button';
import { WInput } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useApp } from '@/context/AppContext';
import { OnboardingStackParamList } from '@/types';
import { searchBreeds } from '@/data/breeds';
import { getAgeString } from '@/data/mockDogs';
import { generateId } from '@/services/storage';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList>;

export const OnboardingStep2: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { state, setDog, addAnotherDog } = useApp();
  const isAdding = state.isAddingAnotherDog;

  const [dogPhoto, setDogPhoto] = useState<string | null>(null);
  const [dogName, setDogName] = useState('');
  const [breedInput, setBreedInput] = useState('');
  const [breedSelected, setBreedSelected] = useState('');
  const [breedResults, setBreedResults] = useState<string[]>([]);
  const [breedFocused, setBreedFocused] = useState(false);
  const [birthDateStr, setBirthDateStr] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  const [photoError, setPhotoError] = useState('');
  const [nameError, setNameError] = useState('');
  const [breedError, setBreedError] = useState('');
  const [loading, setLoading] = useState(false);

  const pickDogPhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setDogPhoto(result.assets[0].uri);
      setPhotoError('');
    }
  };

  const handleBreedChange = useCallback((text: string) => {
    setBreedInput(text);
    setBreedSelected('');
    const results = searchBreeds(text);
    const mixed = 'מעורב / לא יודע';
    const filtered = results.filter(r => r !== mixed).slice(0, 7);
    setBreedResults([...filtered, mixed]);
  }, []);

  const handleBreedSelect = async (breed: string) => {
    await Haptics.selectionAsync();
    setBreedInput(breed);
    setBreedSelected(breed);
    setBreedResults([]);
    setBreedFocused(false);
    setBreedError('');
    Keyboard.dismiss();
  };

  const parseBirthDate = (str: string): string | null => {
    const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
      if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }
    const isoMatch = str.match(/^\d{4}-\d{2}-\d{2}$/);
    if (isoMatch) {
      const date = new Date(str);
      if (!isNaN(date.getTime())) return str;
    }
    return null;
  };

  const parsedBirthDate = parseBirthDate(birthDateStr);
  const ageString = parsedBirthDate ? getAgeString(parsedBirthDate) : null;

  const handleContinue = async () => {
    let hasError = false;
    if (!dogPhoto) {
      setPhotoError('אנא הוסף תמונה של הכלב');
      hasError = true;
    }
    if (!dogName.trim()) {
      setNameError('אנא הכנס את שם הכלב');
      hasError = true;
    }
    if (!breedSelected) {
      setBreedError('אנא בחר גזע');
      hasError = true;
    }
    if (hasError) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const dogId = generateId('dog');
    const dogPayload = {
      id: dogId,
      name: dogName.trim(),
      breed: breedSelected,
      birthDate: parsedBirthDate ?? new Date().toISOString().split('T')[0],
      gender: gender ?? 'male',
      isNeutered: false,
      size: 'm',
      weight: 0,
      furColor: '',
      photos: dogPhoto ? [dogPhoto] : [],
      personality: [],
      energyLevel: 3,
      goodWithDogs: true,
      goodWithKids: true,
      goodWithCats: false,
      trained: 'none',
      activities: [],
      lookingFor: [],
      searchRadius: 10,
      bio: '',
    };

    if (isAdding) {
      addAnotherDog(dogPayload);
    } else {
      setDog(dogPayload);
    }

    setLoading(false);
    navigation.navigate('Step3');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom'] as any}>
      {/* Back button (forest header) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <ProgressBar current={2} total={5} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Forest header */}
            <View style={styles.header}>
              <WText style={styles.headline} color={Colors.white}>
                ספר לנו על הכלב שלך 🐾
              </WText>
              <WText style={styles.subtext} color="rgba(255,255,255,0.8)">
                כמה פרטים בסיסיים
              </WText>
            </View>

            {/* Cream form card */}
            <View style={styles.formSection}>
              {/* Dog photo picker */}
              <View style={styles.photoRow}>
                <TouchableOpacity
                  onPress={pickDogPhoto}
                  style={styles.dogPhotoCircle}
                  activeOpacity={0.8}
                >
                  {dogPhoto ? (
                    <Image source={{ uri: dogPhoto }} style={styles.dogPhotoImage} />
                  ) : (
                    <WText style={styles.dogPhotoPlaceholder}>🐾</WText>
                  )}
                  <View style={styles.cameraOverlay}>
                    <Ionicons name="camera" size={16} color={Colors.white} />
                  </View>
                </TouchableOpacity>
                {photoError ? (
                  <WText variant="caption" color={Colors.error} style={styles.photoError}>
                    {photoError}
                  </WText>
                ) : null}
              </View>

              <View style={styles.formWrap}>
                {/* Dog name */}
                <WInput
                  label="שם הכלב"
                  placeholder="מה שם הכלב שלך?"
                  value={dogName}
                  onChangeText={(t) => {
                    setDogName(t);
                    if (t.trim()) setNameError('');
                  }}
                  error={nameError}
                  returnKeyType="next"
                  autoCapitalize="words"
                />

                <View style={styles.gap} />

                {/* Breed search */}
                <View style={styles.breedWrap}>
                  <WText variant="captionMedium" color={Colors.gray} style={styles.inputLabel}>
                    גזע
                  </WText>
                  <View
                    style={[
                      styles.breedInputContainer,
                      breedFocused && styles.breedInputFocused,
                      breedError ? styles.breedInputError : undefined,
                    ]}
                  >
                    <TextInput
                      style={styles.breedTextInput}
                      placeholder="חפש גזע..."
                      placeholderTextColor={Colors.placeholder}
                      value={breedInput}
                      onChangeText={handleBreedChange}
                      onFocus={() => {
                        setBreedFocused(true);
                        if (!breedInput.trim()) {
                          const results = searchBreeds('');
                          const mixed = 'מעורב / לא יודע';
                          const filtered = results.filter(r => r !== mixed).slice(0, 7);
                          setBreedResults([...filtered, mixed]);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setBreedFocused(false), 200);
                      }}
                      textAlign="right"
                      returnKeyType="done"
                    />
                    {breedSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    ) : null}
                  </View>
                  {breedError ? (
                    <WText variant="caption" color={Colors.error} style={styles.fieldError}>
                      {breedError}
                    </WText>
                  ) : null}

                  {/* Breed dropdown */}
                  {breedFocused && breedResults.length > 0 && (
                    <View style={styles.breedDropdown}>
                      <FlatList
                        data={breedResults}
                        keyExtractor={(item) => item}
                        keyboardShouldPersistTaps="always"
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.breedItem}
                            onPress={() => handleBreedSelect(item)}
                            activeOpacity={0.7}
                          >
                            <WText variant="bodyMedium" color={Colors.text}>
                              {item}
                            </WText>
                          </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.breedSeparator} />}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.gap} />

                {/* Birth date */}
                <WInput
                  label="תאריך לידה"
                  placeholder="DD/MM/YYYY"
                  value={birthDateStr}
                  onChangeText={setBirthDateStr}
                  returnKeyType="done"
                  keyboardType="numbers-and-punctuation"
                />
                {ageString ? (
                  <WText variant="caption" color={Colors.terra} style={styles.ageHint}>
                    גיל: {ageString}
                  </WText>
                ) : null}

                <View style={styles.gap} />

                {/* Gender selector */}
                <WText variant="captionMedium" color={Colors.gray} style={styles.inputLabel}>
                  מין
                </WText>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderChip, gender === 'male' && styles.genderChipSelected]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setGender('male');
                    }}
                    activeOpacity={0.8}
                  >
                    <WText style={[styles.genderChipText, gender === 'male' && styles.genderChipTextSelected]}>
                      ♂ זכר
                    </WText>
                  </TouchableOpacity>

                  <View style={{ width: Spacing.md }} />

                  <TouchableOpacity
                    style={[styles.genderChip, gender === 'female' && styles.genderChipSelected]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setGender('female');
                    }}
                    activeOpacity={0.8}
                  >
                    <WText style={[styles.genderChipText, gender === 'female' && styles.genderChipTextSelected]}>
                      ♀ נקבה
                    </WText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Sticky CTA */}
        <View style={styles.ctaWrap}>
          <WButton
            label="המשך →"
            onPress={handleContinue}
            loading={loading}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.forest,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.forest,
  },
  backBtn: {
    marginRight: Spacing.sm,
  },
  progressWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.forest,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    backgroundColor: Colors.forest,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'] + Radius.large,
    alignItems: 'flex-end',
  },
  headline: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['3xl'],
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: Spacing.xs,
  },
  subtext: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  formSection: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    marginTop: -(Radius.large),
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  photoRow: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dogPhotoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
    overflow: 'hidden',
  },
  dogPhotoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  dogPhotoPlaceholder: {
    fontSize: 48,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  photoError: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  formWrap: {
    gap: 0,
  },
  gap: {
    height: Spacing.base,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  breedWrap: {
    position: 'relative',
    zIndex: 100,
  },
  breedInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.base,
    minHeight: 52,
  },
  breedInputFocused: {
    borderColor: Colors.terra,
    backgroundColor: Colors.white,
  },
  breedInputError: {
    borderColor: Colors.error,
  },
  breedTextInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  breedDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    ...Shadow.medium,
    zIndex: 200,
  },
  breedItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  breedSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
  },
  fieldError: {
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  ageHint: {
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  genderRow: {
    flexDirection: 'row',
  },
  genderChip: {
    flex: 1,
    height: 52,
    borderRadius: Radius.medium,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  genderChipSelected: {
    backgroundColor: Colors.terra,
    borderColor: Colors.terra,
  },
  genderChipText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  genderChipTextSelected: {
    color: Colors.white,
  },
  ctaWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
