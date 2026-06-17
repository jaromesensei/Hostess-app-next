import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Keyboard,
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
import { WTag } from '@/components/ui/Tag';
import { WToggle } from '@/components/ui/Toggle';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useApp } from '@/context/AppContext';
import { OnboardingStackParamList } from '@/types';

type NavProp = NativeStackNavigationProp<OnboardingStackParamList>;

const ENERGY_LABELS: Record<number, string> = {
  1: 'רגוע מאוד',
  2: 'רגוע',
  3: 'מאוזן',
  4: 'אנרגטי',
  5: 'סופר אנרגטי',
};

const PERSONALITY_TAGS = [
  'ידידותי',
  'אנרגטי',
  'רגוע',
  'שובבי',
  'מגן',
  'ביישן',
  'חכם',
  'חברותי',
  'אוהב מים',
  'הרפתקן',
  'אוהב ילדים',
  'נאמן',
];

const ACTIVITIES = [
  'ריצה',
  'שחייה',
  'פריסבי',
  'הנחה',
  'ציד',
  'טיולים',
  'אילוף',
  'סנופרינג',
  'אגיליטי',
];

export const OnboardingStep4: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { state, updateDog } = useApp();
  const dog = state.dog;
  const dogName = dog?.name ?? 'הכלב';

  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [personality, setPersonality] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [goodWithDogs, setGoodWithDogs] = useState(true);
  const [goodWithKids, setGoodWithKids] = useState(true);
  const [goodWithCats, setGoodWithCats] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePersonality = async (tag: string) => {
    await Haptics.selectionAsync();
    setPersonality(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleActivity = async (activity: string) => {
    await Haptics.selectionAsync();
    setActivities(prev =>
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleEnergyPress = async (level: number) => {
    await Haptics.selectionAsync();
    setEnergyLevel(level as 1 | 2 | 3 | 4 | 5);
  };

  const handleContinue = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateDog({
      energyLevel,
      personality,
      activities,
      goodWithDogs,
      goodWithKids,
      goodWithCats,
    });
    setLoading(false);
    navigation.navigate('Step5');
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
        <ProgressBar current={4} total={5} />
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
            <WText style={styles.headline} color={Colors.white}>האישיות של {dogName}</WText>
            <WText style={styles.subtext} color="rgba(255,255,255,0.8)">מה מיוחד בו?</WText>
          </View>

          {/* Cream form card */}
          <View style={styles.formSection}>
            {/* Energy level */}
            <View style={styles.section}>
              <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>
                רמת אנרגיה
              </WText>
              <View style={styles.energyRow}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => handleEnergyPress(level)}
                    style={[
                      styles.energyCircle,
                      energyLevel === level && styles.energyCircleSelected,
                    ]}
                    activeOpacity={0.75}
                  >
                    <WText
                      style={[
                        styles.energyNumber,
                        energyLevel === level && styles.energyNumberSelected,
                      ]}
                    >
                      {level}
                    </WText>
                  </TouchableOpacity>
                ))}
              </View>
              <WText variant="caption" color={Colors.terra} style={styles.energyLabelText}>
                {ENERGY_LABELS[energyLevel]}
              </WText>
            </View>

            {/* Personality tags */}
            <View style={styles.section}>
              <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>
                אישיות (ניתן לבחור כמה)
              </WText>
              <View style={styles.tagsWrap}>
                {PERSONALITY_TAGS.map((tag) => (
                  <WTag
                    key={tag}
                    label={tag}
                    selected={personality.includes(tag)}
                    onPress={() => togglePersonality(tag)}
                    style={styles.tag}
                  />
                ))}
              </View>
            </View>

            {/* Activities */}
            <View style={styles.section}>
              <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>
                פעילויות אהובות
              </WText>
              <View style={styles.tagsWrap}>
                {ACTIVITIES.map((activity) => (
                  <WTag
                    key={activity}
                    label={activity}
                    selected={activities.includes(activity)}
                    onPress={() => toggleActivity(activity)}
                    style={styles.tag}
                  />
                ))}
              </View>
            </View>

            {/* Good with */}
            <View style={styles.section}>
              <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>
                מסתדר עם...
              </WText>
              <View style={styles.goodWithCard}>
                <View style={styles.goodWithRow}>
                  <WToggle value={goodWithDogs} onToggle={setGoodWithDogs} />
                  <MaterialCommunityIcons name="dog" size={18} color={Colors.forest} style={styles.goodWithIcon} />
                  <WText variant="bodyMedium" color={Colors.text} style={styles.goodWithLabel}>כלבים אחרים</WText>
                </View>
                <View style={styles.divider} />
                <View style={styles.goodWithRow}>
                  <WToggle value={goodWithKids} onToggle={setGoodWithKids} />
                  <Ionicons name="people-outline" size={18} color={Colors.forest} style={styles.goodWithIcon} />
                  <WText variant="bodyMedium" color={Colors.text} style={styles.goodWithLabel}>ילדים</WText>
                </View>
                <View style={styles.divider} />
                <View style={styles.goodWithRow}>
                  <WToggle value={goodWithCats} onToggle={setGoodWithCats} />
                  <MaterialCommunityIcons name="cat" size={18} color={Colors.forest} style={styles.goodWithIcon} />
                  <WText variant="bodyMedium" color={Colors.text} style={styles.goodWithLabel}>חתולים</WText>
                </View>
              </View>
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
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  energyCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.cream2,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyCircleSelected: {
    backgroundColor: Colors.terra,
    borderColor: Colors.terra,
    ...Shadow.soft,
  },
  energyNumber: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.gray,
  },
  energyNumberSelected: {
    color: Colors.white,
  },
  energyLabelText: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    marginBottom: 0,
  },
  goodWithCard: {
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  goodWithRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  goodWithIcon: { marginRight: Spacing.sm },
  goodWithLabel: {
    marginRight: Spacing.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.base,
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
