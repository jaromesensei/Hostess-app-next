import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { RootStackParamList, OnboardingStackParamList } from '@/types';
import { NativeStackNavigationProp as RootNavProp } from '@react-navigation/native-stack';

type OnboardingNavProp = NativeStackNavigationProp<OnboardingStackParamList>;
type RootNavType = RootNavProp<RootStackParamList>;

type LookingForValue = 'friends' | 'breeding' | 'walks';

interface LookingForCard {
  value: LookingForValue;
  icon: string;
  lib: 'ion' | 'mci';
  color: string;
  title: string;
  description: string;
}

const LOOKING_FOR_OPTIONS: LookingForCard[] = [
  {
    value: 'friends',
    icon: 'paw', lib: 'mci', color: Colors.terra,
    title: 'חברים לטיולים',
    description: 'לפגוש כלבים ולצאת ביחד',
  },
  {
    value: 'breeding',
    icon: 'heart', lib: 'ion', color: '#E91E8C',
    title: 'זיווג אחראי',
    description: 'רק עם בדיקות בריאות מאושרות',
  },
  {
    value: 'walks',
    icon: 'walk', lib: 'mci', color: Colors.forest,
    title: 'שותפים לריצה',
    description: 'בעלים שאוהבים לזוז',
  },
];

const RADIUS_OPTIONS = [1, 5, 10, 25, 50];

export const OnboardingStep5: React.FC = () => {
  const onboardingNav = useNavigation<OnboardingNavProp>();
  const rootNav = useNavigation<RootNavType>();

  const { state, updateDog, completeOnboarding, stopAddingAnotherDog } = useApp();
  const isAdding = state.isAddingAnotherDog;
  const dog = state.dog;
  const dogName = dog?.name ?? 'הכלב';

  const [lookingFor, setLookingFor] = useState<LookingForValue[]>([]);
  const [searchRadius, setSearchRadius] = useState(10);
  const [bio, setBio] = useState('');
  const [lookingForError, setLookingForError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLookingFor = async (value: LookingForValue) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLookingFor(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
    setLookingForError('');
  };

  const handleStart = async () => {
    if (lookingFor.length === 0) {
      setLookingForError('אנא בחר לפחות אפשרות אחת');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updateDog({ lookingFor, searchRadius, bio: bio.trim(), trained: 'basic' });

      if (isAdding) {
        stopAddingAnotherDog();
        (rootNav as any).navigate('MainApp');
      } else {
        await completeOnboarding();
        (rootNav as any).navigate('WelcomeMoment');
      }
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom'] as any}>
      {/* Back button (forest header) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onboardingNav.goBack();
          }}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <ProgressBar current={5} total={5} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Forest header */}
          <View style={styles.header}>
            <WText style={styles.headline} color={Colors.white}>מה {dogName} מחפש?</WText>
            <WText style={styles.subtext} color="rgba(255,255,255,0.8)">נמצא את ההתאמה המושלמת</WText>
          </View>

          {/* Cream form card */}
          <View style={styles.formSection}>
            {/* Looking for cards */}
            <View style={styles.section}>
              {lookingForError ? (
                <WText variant="caption" color={Colors.error} style={styles.lookingForError}>
                  {lookingForError}
                </WText>
              ) : null}
              {LOOKING_FOR_OPTIONS.map((option) => {
                const isSelected = lookingFor.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.lookingForCard, isSelected && styles.lookingForCardSelected]}
                    onPress={() => toggleLookingFor(option.value)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.lookingForCardContent}>
                      <View style={styles.lookingForTextWrap}>
                        <WText
                          variant="title"
                          color={isSelected ? Colors.terra : Colors.text}
                          style={styles.lookingForTitle}
                        >
                          {option.title}
                        </WText>
                        <WText variant="caption" color={Colors.gray} style={styles.lookingForDesc}>
                          {option.description}
                        </WText>
                      </View>
                      <View style={[styles.lookingForIconCircle, { backgroundColor: option.color + '18' }]}>
                        {option.lib === 'mci'
                          ? <MaterialCommunityIcons name={option.icon as any} size={26} color={option.color} />
                          : <Ionicons name={option.icon as any} size={26} color={option.color} />
                        }
                      </View>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={14} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Search radius */}
            <View style={styles.section}>
              <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>
                רדיוס חיפוש: {searchRadius} ק"מ
              </WText>
              <View style={styles.radiusRow}>
                {RADIUS_OPTIONS.map((km) => (
                  <TouchableOpacity
                    key={km}
                    style={[styles.radiusPill, searchRadius === km && styles.radiusPillSelected]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSearchRadius(km);
                    }}
                    activeOpacity={0.75}
                  >
                    <WText
                      variant="captionMedium"
                      color={searchRadius === km ? Colors.white : Colors.gray}
                    >
                      {km}
                    </WText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bio */}
            <View style={styles.section}>
              <WInput
                label={`ספר על ${dogName} (אופציונלי)`}
                placeholder="תאר את הכלב שלך בכמה מילים..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={200}
                style={styles.bioInput}
                returnKeyType="done"
              />
              <WText variant="caption" color={Colors.gray} style={styles.charCount}>
                {bio.length}/200
              </WText>
            </View>
          </View>
        </ScrollView>

        {/* Sticky CTA */}
        <View style={styles.ctaWrap}>
          <WButton
            label="בואו נתחיל"
            onPress={handleStart}
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  lookingForError: {
    textAlign: 'right',
    marginBottom: Spacing.sm,
  },
  lookingForCard: {
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: Spacing.md,
    ...Shadow.soft,
    position: 'relative',
  },
  lookingForCardSelected: {
    borderColor: Colors.terra,
    backgroundColor: 'rgba(232,115,74,0.06)',
  },
  lookingForCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: Spacing.base,
  },
  lookingForTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: Spacing.md,
  },
  lookingForTitle: {
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 2,
  },
  lookingForDesc: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  lookingForIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  radiusPill: {
    flex: 1,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  radiusPillSelected: {
    backgroundColor: Colors.terra,
    borderColor: Colors.terra,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'left',
    marginTop: Spacing.xs,
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
