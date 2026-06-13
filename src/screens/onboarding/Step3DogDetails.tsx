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

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';
import { WButton } from '@/components/ui/Button';
import { WInput } from '@/components/ui/Input';
import { WToggle } from '@/components/ui/Toggle';
import { WTag } from '@/components/ui/Tag';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useApp } from '@/context/AppContext';
import { OnboardingStackParamList } from '@/types';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList>;

type DogSize = 'xs' | 's' | 'm' | 'l' | 'xl';

const SIZES: { key: DogSize; label: string; emoji: string }[] = [
  { key: 'xs', label: 'XS', emoji: '🐭' },
  { key: 's', label: 'S', emoji: '🐩' },
  { key: 'm', label: 'M', emoji: '🐕' },
  { key: 'l', label: 'L', emoji: '🦮' },
  { key: 'xl', label: 'XL', emoji: '🐻' },
];

const FUR_COLORS = [
  { label: 'שחור', emoji: '⬛' },
  { label: 'לבן', emoji: '⬜' },
  { label: 'חום', emoji: '🟫' },
  { label: 'זהוב', emoji: '🟡' },
  { label: 'אפור', emoji: '🩶' },
  { label: 'שלוש-צבעים', emoji: '🎨' },
  { label: 'מנוקד', emoji: '🔘' },
  { label: 'אחר', emoji: '➕' },
];

export const OnboardingStep3: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { state, updateDog } = useApp();
  const dog = state.dog;
  const dogName = dog?.name ?? 'הכלב';
  const isFemale = dog?.gender === 'female';

  const [isNeutered, setIsNeutered] = useState(false);
  const [size, setSize] = useState<DogSize>('m');
  const [weight, setWeight] = useState('');
  const [furColor, setFurColor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateDog({
      isNeutered,
      size,
      weight: parseFloat(weight) || 0,
      furColor,
    });
    setLoading(false);
    navigation.navigate('Step4');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom'] as any}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.forest} />
        </TouchableOpacity>
        <View style={styles.progressInline}>
          <ProgressBar current={3} total={5} />
        </View>
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
          {/* Headline */}
          <WText variant="h2" color={Colors.forest} style={styles.headline}>
            קצת יותר על {dogName} 🐶
          </WText>

          {/* Neutered toggle */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <WToggle value={isNeutered} onToggle={setIsNeutered} />
              <WText variant="bodyMedium" color={Colors.text} style={styles.toggleLabel}>
                {isFemale ? 'מעוקרת?' : 'מסורס?'}
              </WText>
            </View>
          </View>

          {/* Size selector */}
          <View style={styles.section}>
            <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>
              גודל
            </WText>
            <View style={styles.sizeRow}>
              {SIZES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.sizeCard,
                    size === s.key && styles.sizeCardSelected,
                  ]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSize(s.key);
                  }}
                  activeOpacity={0.75}
                >
                  <WText style={styles.sizeEmoji}>{s.emoji}</WText>
                  <WText
                    variant="label"
                    color={size === s.key ? Colors.terra : Colors.gray}
                    style={styles.sizeLabel}
                  >
                    {s.label}
                  </WText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight */}
          <View style={styles.section}>
            <WInput
              label="משקל"
              placeholder="0.0"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              returnKeyType="done"
              suffix={
                <WText variant="bodyMedium" color={Colors.gray}>
                  ק״ג
                </WText>
              }
            />
          </View>

          {/* Fur color */}
          <View style={styles.section}>
            <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>
              צבע פרווה
            </WText>
            <View style={styles.furRow}>
              {FUR_COLORS.map((fc) => {
                const fullLabel = `${fc.emoji} ${fc.label}`;
                const isSelected = furColor === fc.label;
                return (
                  <WTag
                    key={fc.label}
                    label={fullLabel}
                    selected={isSelected}
                    onPress={() => setFurColor(isSelected ? '' : fc.label)}
                    style={styles.furTag}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>

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
    backgroundColor: Colors.cream,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    marginRight: Spacing.sm,
  },
  progressInline: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headline: {
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    ...Shadow.soft,
  },
  toggleLabel: {
    marginRight: Spacing.md,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sizeCard: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: Radius.medium,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.soft,
  },
  sizeCardSelected: {
    borderColor: Colors.terra,
    backgroundColor: 'rgba(232,115,74,0.08)',
  },
  sizeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  sizeLabel: {
    textAlign: 'center',
  },
  furRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  furTag: {
    marginBottom: 0,
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
