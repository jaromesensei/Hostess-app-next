import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
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

const SIZES: { key: DogSize; label: string; sub: string }[] = [
  { key: 'xs', label: 'XS', sub: 'עד 5 ק"מ' },
  { key: 's',  label: 'S',  sub: '5–10'    },
  { key: 'm',  label: 'M',  sub: '10–20'   },
  { key: 'l',  label: 'L',  sub: '20–35'   },
  { key: 'xl', label: 'XL', sub: '35+'     },
];

const FUR_COLORS: { label: string; color: string }[] = [
  { label: 'שחור',        color: '#1A1A1A' },
  { label: 'לבן',         color: '#F5F5F0' },
  { label: 'חום',         color: '#8B5E3C' },
  { label: 'זהוב',        color: '#D4A843' },
  { label: 'אפור',        color: '#9E9E9E' },
  { label: 'שלוש-צבעים',  color: '#6C3483' },
  { label: 'מנוקד',       color: '#2E86C1' },
  { label: 'אחר',         color: Colors.terra },
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
        <ProgressBar current={3} total={5} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              {/* Forest header */}
              <View style={styles.header}>
                <WText style={styles.headline} color={Colors.white}>קצת יותר על {dogName}</WText>
                <WText style={styles.subtext} color="rgba(255,255,255,0.8)">נשלים את פרופיל הכלב</WText>
              </View>

              {/* Cream form card */}
              <View style={styles.formSection}>
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
                  <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>גודל</WText>
                  <View style={styles.sizeRow}>
                    {SIZES.map((s) => (
                      <TouchableOpacity
                        key={s.key}
                        style={[styles.sizeCard, size === s.key && styles.sizeCardSelected]}
                        onPress={async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSize(s.key); }}
                        activeOpacity={0.75}
                      >
                        <WText style={[styles.sizeLabel, size === s.key && styles.sizeLabelSelected]}>{s.label}</WText>
                        <WText style={[styles.sizeSub, size === s.key && styles.sizeSubSelected]}>{s.sub}</WText>
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
                    onSubmitEditing={Keyboard.dismiss}
                    suffix={<WText variant="bodyMedium" color={Colors.gray}>ק״ג</WText>}
                  />
                </View>

                {/* Fur color */}
                <View style={styles.section}>
                  <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>צבע פרווה</WText>
                  <View style={styles.furRow}>
                    {FUR_COLORS.map((fc) => {
                      const isSelected = furColor === fc.label;
                      return (
                        <TouchableOpacity
                          key={fc.label}
                          style={[styles.furChip, isSelected && styles.furChipSelected]}
                          onPress={async () => { await Haptics.selectionAsync(); setFurColor(isSelected ? '' : fc.label); }}
                          activeOpacity={0.75}
                        >
                          <View style={[styles.furSwatch, { backgroundColor: fc.color }, isSelected && styles.furSwatchSelected]} />
                          <WText style={[styles.furLabel, isSelected && styles.furLabelSelected]}>{fc.label}</WText>
                          {isSelected && <Ionicons name="checkmark" size={12} color={Colors.terra} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
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
    paddingVertical: Spacing.md,
    borderRadius: Radius.medium,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.sm,
    gap: 2,
  },
  sizeCardSelected: {
    borderColor: Colors.terra,
    backgroundColor: 'rgba(232,115,74,0.08)',
  },
  sizeLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.gray,
    textAlign: 'center',
  },
  sizeLabelSelected: { color: Colors.terra },
  sizeSub: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: Colors.gray,
    textAlign: 'center',
  },
  sizeSubSelected: { color: Colors.terra },
  furRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  furChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cream2,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  furChipSelected: {
    borderColor: Colors.terra,
    backgroundColor: 'rgba(232,115,74,0.06)',
  },
  furSwatch: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)',
  },
  furSwatchSelected: { borderColor: Colors.terra },
  furLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  furLabelSelected: { color: Colors.terra },
  ctaWrap: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.cream,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
