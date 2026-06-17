import React, { useState, useCallback, useRef } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

// Auto-format DD/MM/YYYY as user types
function formatDateInput(raw: string, prev: string): string {
  const digits = raw.replace(/\D/g, '');
  const prevDigits = prev.replace(/\D/g, '');
  // If deleting, don't re-add slashes
  if (digits.length < prevDigits.length) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

export const OnboardingStep2: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { state, setDog, addAnotherDog } = useApp();
  const isAdding = state.isAddingAnotherDog;
  const scrollRef = useRef<ScrollView>(null);

  const [dogPhoto, setDogPhoto] = useState<string | null>(null);
  const [dogName, setDogName] = useState('');
  const [breedInput, setBreedInput] = useState('');
  const [breedSelected, setBreedSelected] = useState('');
  const [breedResults, setBreedResults] = useState<string[]>([]);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [birthDateStr, setBirthDateStr] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  const [photoError, setPhotoError] = useState('');
  const [nameError, setNameError] = useState('');
  const [breedError, setBreedError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [dateError, setDateError] = useState('');
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
    setBreedError('');
    const results = searchBreeds(text);
    const mixed = 'מעורב / לא יודע';
    const filtered = results.filter(r => r !== mixed).slice(0, 6);
    setBreedResults([...filtered, mixed]);
    setShowBreedDropdown(true);
  }, []);

  const handleBreedFocus = useCallback(() => {
    if (!breedInput.trim()) {
      const results = searchBreeds('');
      const mixed = 'מעורב / לא יודע';
      const filtered = results.filter(r => r !== mixed).slice(0, 6);
      setBreedResults([...filtered, mixed]);
    }
    setShowBreedDropdown(true);
    // Scroll down so dropdown is visible
    setTimeout(() => scrollRef.current?.scrollTo({ y: 200, animated: true }), 300);
  }, [breedInput]);

  const handleBreedSelect = async (breed: string) => {
    await Haptics.selectionAsync();
    setBreedInput(breed);
    setBreedSelected(breed);
    setBreedResults([]);
    setShowBreedDropdown(false);
    setBreedError('');
    Keyboard.dismiss();
  };

  const handleDateChange = useCallback((text: string) => {
    const formatted = formatDateInput(text, birthDateStr);
    setBirthDateStr(formatted);
    setDateError('');
    // Validate when fully entered
    if (formatted.length === 10) {
      const parsed = parseBirthDate(formatted);
      if (!parsed) setDateError('תאריך לא תקין');
    }
  }, [birthDateStr]);

  const parseBirthDate = (str: string): string | null => {
    const dmyMatch = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      const date = new Date(`${y}-${m}-${d}`);
      if (!isNaN(date.getTime()) && date <= new Date()) {
        return date.toISOString().split('T')[0];
      }
    }
    return null;
  };

  const parsedBirthDate = parseBirthDate(birthDateStr);
  const ageString = parsedBirthDate ? getAgeString(parsedBirthDate) : null;

  const handleContinue = async () => {
    let hasError = false;
    if (!dogPhoto) { setPhotoError('אנא הוסף תמונה של הכלב'); hasError = true; }
    if (!dogName.trim()) { setNameError('אנא הכנס את שם הכלב'); hasError = true; }
    if (!breedSelected) { setBreedError('אנא בחר גזע מהרשימה'); hasError = true; }
    if (!gender) { setGenderError('אנא בחר מין'); hasError = true; }
    if (birthDateStr && !parsedBirthDate) { setDateError('תאריך לא תקין'); hasError = true; }
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
      gender: gender!,
      isNeutered: false,
      size: 'm' as const,
      weight: 0,
      furColor: '',
      photos: dogPhoto ? [dogPhoto] : [],
      personality: [],
      energyLevel: 3 as const,
      goodWithDogs: true,
      goodWithKids: true,
      goodWithCats: false,
      trained: 'none' as const,
      activities: [],
      lookingFor: [] as any,
      searchRadius: 10,
      bio: '',
    };

    if (isAdding) { addAnotherDog(dogPayload); } else { setDog(dogPayload); }
    setLoading(false);
    navigation.navigate('Step3');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom'] as any}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.goBack(); }}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar current={2} total={5} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowBreedDropdown(false); }}>
            <View>
              {/* Forest header */}
              <View style={styles.header}>
                <WText style={styles.headline} color={Colors.white}>ספר לנו על הכלב שלך</WText>
                <WText style={styles.subtext} color="rgba(255,255,255,0.8)">כמה פרטים בסיסיים</WText>
              </View>

              {/* Cream form card */}
              <View style={styles.formSection}>
                {/* Dog photo */}
                <View style={styles.photoRow}>
                  <TouchableOpacity onPress={pickDogPhoto} style={styles.dogPhotoCircle} activeOpacity={0.8}>
                    {dogPhoto ? (
                      <Image source={{ uri: dogPhoto }} style={styles.dogPhotoImage} />
                    ) : (
                      <MaterialCommunityIcons name="paw" size={48} color={Colors.cream2} />
                    )}
                    <View style={styles.cameraOverlay}>
                      <Ionicons name="camera" size={16} color={Colors.white} />
                    </View>
                  </TouchableOpacity>
                  {photoError ? (
                    <WText variant="caption" color={Colors.error} style={styles.photoError}>{photoError}</WText>
                  ) : (
                    <WText variant="caption" color={Colors.gray} style={styles.photoError}>הוסף תמונה של הכלב</WText>
                  )}
                </View>

                <View style={styles.formWrap}>
                  {/* Dog name */}
                  <WInput
                    label="שם הכלב"
                    placeholder="מה שם הכלב שלך?"
                    value={dogName}
                    onChangeText={t => { setDogName(t); if (t.trim()) setNameError(''); }}
                    error={nameError}
                    returnKeyType="next"
                    autoCapitalize="words"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <View style={styles.gap} />

                  {/* Breed search — zIndex high so dropdown floats above siblings */}
                  <View style={styles.breedWrap}>
                    <WText variant="captionMedium" color={Colors.gray} style={styles.inputLabel}>גזע</WText>
                    <View style={[
                      styles.breedInputContainer,
                      showBreedDropdown && styles.breedInputFocused,
                      breedError ? styles.breedInputError : undefined,
                    ]}>
                      <TextInput
                        style={styles.breedTextInput}
                        placeholder="חפש גזע..."
                        placeholderTextColor={Colors.gray}
                        value={breedInput}
                        onChangeText={handleBreedChange}
                        onFocus={handleBreedFocus}
                        onBlur={() => setTimeout(() => setShowBreedDropdown(false), 200)}
                        textAlign="right"
                        returnKeyType="done"
                        onSubmitEditing={() => setShowBreedDropdown(false)}
                      />
                      {breedSelected
                        ? <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                        : <Ionicons name="search" size={16} color={Colors.gray} />
                      }
                    </View>
                    {breedError
                      ? <WText variant="caption" color={Colors.error} style={styles.fieldError}>{breedError}</WText>
                      : null
                    }

                    {/* Dropdown — NOT absolutely positioned; rendered inline to avoid clipping */}
                    {showBreedDropdown && breedResults.length > 0 && (
                      <View style={styles.breedDropdown}>
                        {breedResults.map((item, index) => (
                          <TouchableOpacity
                            key={item}
                            style={[styles.breedItem, index < breedResults.length - 1 && styles.breedItemBorder]}
                            onPress={() => handleBreedSelect(item)}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={item === 'מעורב / לא יודע' ? 'help-circle-outline' : 'paw-outline'}
                              size={14}
                              color={Colors.terra}
                              style={{ marginLeft: Spacing.sm }}
                            />
                            <WText variant="bodyMedium" color={Colors.text}>{item}</WText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.gap} />

                  {/* Birth date — auto-formatted */}
                  <View>
                    <WInput
                      label="תאריך לידה"
                      placeholder="DD/MM/YYYY"
                      value={birthDateStr}
                      onChangeText={handleDateChange}
                      returnKeyType="done"
                      keyboardType="number-pad"
                      maxLength={10}
                      onSubmitEditing={Keyboard.dismiss}
                      error={dateError}
                    />
                    {ageString && !dateError ? (
                      <View style={styles.ageHintRow}>
                        <Ionicons name="gift-outline" size={13} color={Colors.terra} />
                        <WText variant="caption" color={Colors.terra}>גיל: {ageString}</WText>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.gap} />

                  {/* Gender selector */}
                  <WText variant="captionMedium" color={Colors.gray} style={styles.inputLabel}>מין</WText>
                  <View style={styles.genderRow}>
                    <TouchableOpacity
                      style={[styles.genderChip, gender === 'male' && styles.genderChipSelected]}
                      onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGender('male'); setGenderError(''); }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="male" size={18} color={gender === 'male' ? Colors.white : Colors.terra} />
                      <WText style={[styles.genderChipText, gender === 'male' && styles.genderChipTextSelected]}>זכר</WText>
                    </TouchableOpacity>
                    <View style={{ width: Spacing.md }} />
                    <TouchableOpacity
                      style={[styles.genderChip, gender === 'female' && styles.genderChipSelected, gender === 'female' && styles.genderChipSelectedFemale]}
                      onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGender('female'); setGenderError(''); }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="female" size={18} color={gender === 'female' ? Colors.white : Colors.pink} />
                      <WText style={[styles.genderChipText, gender === 'female' && styles.genderChipTextSelected]}>נקבה</WText>
                    </TouchableOpacity>
                  </View>
                  {genderError ? (
                    <WText variant="caption" color={Colors.error} style={styles.fieldError}>{genderError}</WText>
                  ) : null}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {/* Sticky CTA */}
        <View style={styles.ctaWrap}>
          <WButton label="המשך" onPress={handleContinue} loading={loading} disabled={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.forest },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.forest,
  },
  backBtn: { marginRight: Spacing.sm },
  progressWrap: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm, backgroundColor: Colors.forest },
  scrollContent: { flexGrow: 1, paddingBottom: Spacing.xl },
  header: {
    backgroundColor: Colors.forest,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'] + Radius.large,
    alignItems: 'flex-end',
  },
  headline: {
    fontFamily: FontFamily.displayBlack, fontSize: FontSize['3xl'],
    textAlign: 'right', writingDirection: 'rtl', marginBottom: Spacing.xs,
  },
  subtext: { fontFamily: FontFamily.regular, fontSize: FontSize.base, textAlign: 'right', writingDirection: 'rtl' },
  formSection: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.large, borderTopRightRadius: Radius.large,
    marginTop: -(Radius.large),
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xl,
  },
  photoRow: { alignItems: 'center', marginBottom: Spacing.xl },
  dogPhotoCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.forestDim,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  dogPhotoImage: { width: 140, height: 140, borderRadius: 70 },
  cameraOverlay: {
    position: 'absolute', bottom: 6, right: 6,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.terra,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  photoError: { marginTop: Spacing.sm, textAlign: 'center' },
  formWrap: { gap: 0 },
  gap: { height: Spacing.base },
  inputLabel: { marginBottom: Spacing.xs, textAlign: 'right' },

  // Breed
  breedWrap: {},
  breedInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    borderWidth: 1.5, borderColor: 'transparent',
    paddingHorizontal: Spacing.base, minHeight: 52,
  },
  breedInputFocused: { borderColor: Colors.terra, backgroundColor: Colors.white },
  breedInputError: { borderColor: Colors.error },
  breedTextInput: {
    flex: 1, fontFamily: FontFamily.medium,
    fontSize: FontSize.base, color: Colors.text, paddingVertical: Spacing.md,
  },
  breedDropdown: {
    backgroundColor: Colors.white,
    borderRadius: Radius.medium,
    borderWidth: 1, borderColor: Colors.border,
    marginTop: 4, ...Shadow.md,
  },
  breedItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    flexDirection: 'row-reverse' as any,
  },
  breedItemBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  fieldError: { marginTop: Spacing.xs, textAlign: 'right' },

  // Date
  ageHintRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: Spacing.xs, justifyContent: 'flex-end',
  },

  // Gender
  genderRow: { flexDirection: 'row' },
  genderChip: {
    flex: 1, height: 52, borderRadius: Radius.medium,
    backgroundColor: Colors.cream2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    flexDirection: 'row', gap: Spacing.sm,
  },
  genderChipSelected: { backgroundColor: Colors.terra, borderColor: Colors.terra },
  genderChipSelectedFemale: { backgroundColor: Colors.pink, borderColor: Colors.pink },
  genderChipText: { fontFamily: FontFamily.semibold, fontSize: FontSize.md, color: Colors.text },
  genderChipTextSelected: { color: Colors.white },

  ctaWrap: {
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, paddingTop: Spacing.md,
    backgroundColor: Colors.cream, borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
