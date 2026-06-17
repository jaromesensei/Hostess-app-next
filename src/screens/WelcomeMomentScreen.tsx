import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Spacing, Radius, Shadow, FontFamily, FontSize } from '@/theme';
import { WText, WButton, WTag, Skeleton } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { generateWelcomeContent } from '@/services/gemini';
import { getAgeString } from '@/data/mockDogs';
import { RootStackParamList, WelcomeAIContent } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList, 'WelcomeMoment'>;

// Deterministic nearby-dog count based on dog id
function getNearbyCount(dogId: string): number {
  let hash = 0;
  for (let i = 0; i < dogId.length; i++) {
    hash = (hash * 31 + dogId.charCodeAt(i)) & 0xffffffff;
  }
  return 800 + (Math.abs(hash) % 401); // 800-1200
}

export const WelcomeMomentScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { state } = useApp();
  const dog = state.dog;
  const ownerName = state.ownerName;

  // Animation values
  const cardScale = useRef(new Animated.Value(0.7)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(12)).current;
  const aiCardOpacity = useRef(new Animated.Value(0)).current;
  const aiCardTranslateY = useRef(new Animated.Value(60)).current;

  // AI content state
  const [aiContent, setAiContent] = useState<WelcomeAIContent | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiContentVisible, setAiContentVisible] = useState(false);

  const nearbyCount = dog ? getNearbyCount(dog.id) : 950;
  const pronoun = dog?.gender === 'female' ? 'אותה' : 'אותו';

  // Sequence animations on mount
  useEffect(() => {
    // t=0: dog card springs in
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, damping: 14, stiffness: 120, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // t=800ms: welcome text fades in
    const t1 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(welcomeOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(welcomeTranslateY, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
      ]).start();
    }, 800);

    // t=1200ms: AI card slides up
    const t2 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(aiCardOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(aiCardTranslateY, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
      ]).start();
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Fetch AI content on mount
  useEffect(() => {
    if (!dog) return;
    setAiLoading(true);
    generateWelcomeContent(dog)
      .then(content => {
        setAiContent(content);
        setAiLoading(false);
        setAiContentVisible(true);
      })
      .catch(() => {
        setAiLoading(false);
        setAiContentVisible(true);
      });
  }, [dog]);

  const handleCTA = useCallback(() => {
    navigation.navigate('MainApp');
  }, [navigation]);

  if (!dog) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <WText variant="h2" center color={Colors.forest}>
            טוען...
          </WText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Dog profile card ── */}
        <Animated.View style={[styles.dogCard, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>
          {/* Dog photo */}
          <View style={styles.photoRing}>
            <Image
              source={{ uri: dog.photos[0] }}
              style={styles.dogPhoto}
              resizeMode="cover"
            />
          </View>

          {/* Dog name */}
          <WText
            variant="h2"
            color={Colors.forest}
            center
            style={styles.dogName}
          >
            {dog.name}
          </WText>

          {/* Breed · age */}
          <WText
            variant="captionMedium"
            color={Colors.gray}
            center
            style={styles.breedAge}
          >
            {dog.breed} · {getAgeString(dog.birthDate)}
          </WText>

          {/* Personality tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsRow}
            style={styles.tagsScroll}
          >
            {dog.personality.map(tag => (
              <WTag
                key={tag}
                label={tag}
                small
                color={Colors.forest}
                style={styles.tag}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Welcome text ── */}
        <Animated.View style={[styles.welcomeSection, { opacity: welcomeOpacity, transform: [{ translateY: welcomeTranslateY }] }]}>
          <WText variant="h1" color={Colors.forest} center>
            ברוכים הבאים למשפחה
          </WText>
          <WText
            variant="body"
            color={Colors.gray}
            center
            style={styles.welcomeSubtext}
          >
            {dog.name} לא לבד יותר.{' '}
            <WText
              variant="bodySemibold"
              color={Colors.forest}
            >
              {nearbyCount.toLocaleString()}
            </WText>{' '}
            כלבים מחכים להכיר {pronoun}.
          </WText>
        </Animated.View>

        {/* ── AI card ── */}
        <Animated.View style={[styles.aiCard, { opacity: aiCardOpacity, transform: [{ translateY: aiCardTranslateY }] }]}>
          {/* Header */}
          <View style={styles.aiHeader}>
            <View style={styles.aiHeaderRow}>
              <MaterialCommunityIcons name="brain" size={18} color={Colors.white} />
              <WText style={styles.aiHeaderLabel}>Woofy AI</WText>
            </View>
          </View>

          {/* Content */}
          <View style={styles.aiContent}>
            {aiLoading ? (
              /* Skeleton state */
              <View style={styles.skeletonContainer}>
                <Skeleton width="90%" height={16} style={styles.skeletonRow} />
                <Skeleton width="80%" height={16} style={styles.skeletonRow} />
                <Skeleton width="70%" height={16} style={styles.skeletonRowLast} />
                <View style={styles.divider} />
                <Skeleton width="50%" height={13} style={styles.skeletonRow} />
                <Skeleton width="85%" height={16} style={styles.skeletonRow} />
                <Skeleton width="40%" height={13} style={styles.skeletonRowLast} />
                <View style={styles.divider} />
                <Skeleton width="45%" height={13} style={styles.skeletonRow} />
                <Skeleton width="75%" height={16} style={styles.skeletonRowLast} />
              </View>
            ) : aiContent ? (
              /* Loaded AI content */
              <View>
                {/* Compliment */}
                <WText
                  variant="body"
                  color={Colors.text}
                  style={styles.complimentText}
                >
                  {aiContent.compliment}
                </WText>

                <View style={styles.divider} />

                {/* Tip */}
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionLabelRow}>
                    <Ionicons name="bulb-outline" size={14} color={Colors.forest} />
                    <WText style={styles.sectionLabel}>טיפ מחקרי</WText>
                  </View>
                  <WText
                    variant="bodyMedium"
                    color={Colors.text}
                    style={styles.sectionText}
                  >
                    {aiContent.tip}
                  </WText>
                  {aiContent.tipSource ? (
                    <WText
                      variant="caption"
                      color={Colors.gray}
                      style={styles.tipSource}
                    >
                      {aiContent.tipSource}
                    </WText>
                  ) : null}
                </View>

                <View style={styles.divider} />

                {/* Fun fact */}
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionLabelRow}>
                    <Ionicons name="sparkles-outline" size={14} color={Colors.forest} />
                    <WText style={styles.sectionLabel}>ידעת?</WText>
                  </View>
                  <WText
                    variant="bodyMedium"
                    color={Colors.text}
                    style={styles.sectionText}
                  >
                    {aiContent.funFact}
                  </WText>
                </View>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ── CTA ── */}
        <View style={styles.ctaContainer}>
          <WButton
            label="בואו נמצא חברים"
            onPress={handleCTA}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dog card
  dogCard: {
    backgroundColor: Colors.cream2,
    borderRadius: Radius.large,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.medium,
    marginBottom: Spacing.xl,
  },
  photoRing: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 2.5,
    borderColor: Colors.white,
    ...Shadow.soft,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  dogPhoto: {
    width: 121,
    height: 121,
    borderRadius: 60.5,
  },
  dogName: {
    marginTop: 4,
    marginBottom: 4,
  },
  breedAge: {
    marginBottom: Spacing.md,
  },
  tagsScroll: {
    width: '100%',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: 4,
  },
  tag: {
    marginRight: 0,
  },

  // Welcome section
  welcomeSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  welcomeSubtext: {
    marginTop: Spacing.sm,
    lineHeight: 22,
  },

  // AI card
  aiCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadow.medium,
    marginBottom: Spacing.xl,
  },
  aiHeader: {
    backgroundColor: Colors.forest,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  aiHeaderLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
    textAlign: 'center',
  },
  aiContent: {
    padding: Spacing.base,
  },
  skeletonContainer: {
    paddingVertical: Spacing.sm,
  },
  skeletonRow: {
    marginBottom: Spacing.sm,
  },
  skeletonRowLast: {
    marginBottom: Spacing.md,
  },
  complimentText: {
    fontStyle: 'italic',
    lineHeight: 24,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  sectionBlock: {
    marginBottom: 4,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.forest,
  },
  sectionText: {
    lineHeight: 22,
    color: Colors.text,
  },
  tipSource: {
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },

  // CTA
  ctaContainer: {
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
});
