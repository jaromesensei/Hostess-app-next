import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = 'monthly' | 'annual';

// ─── Feature list ─────────────────────────────────────────────────────────────

const FREE_FEATURES: { label: string; included: boolean }[] = [
  { label: 'פרופיל כלב בסיסי',              included: true  },
  { label: 'פיד חברתי ופוסטים',              included: true  },
  { label: 'מפה ומקומות לכלבים',             included: true  },
  { label: '5 התאמות ביום',                  included: true  },
  { label: 'חיפוש שירותים',                  included: true  },
  { label: 'גישה לאירועים ציבוריים',          included: true  },
  { label: 'התאמות ללא הגבלה',               included: false },
  { label: 'תג "מאומת" בפרופיל ✓',           included: false },
  { label: 'עדיפות בחיפוש שירותים',          included: false },
  { label: 'סטטיסטיקות פוסטים',              included: false },
  { label: 'אירועים בלעדיים לחברי Pro',       included: false },
  { label: 'ממשק ללא פרסומות',               included: false },
];

const PRO_FEATURES: { label: string; icon: string }[] = [
  { label: 'התאמות ללא הגבלה',               icon: '❤️' },
  { label: 'תג "מאומת" בפרופיל ✓',           icon: '✅' },
  { label: 'עדיפות בחיפוש שירותים',          icon: '⭐' },
  { label: 'סטטיסטיקות פוסטים מתקדמות',      icon: '📊' },
  { label: 'אירועים בלעדיים לחברי Pro',       icon: '🎫' },
  { label: 'ממשק ללא פרסומות',               icon: '🚫' },
  { label: 'גיבוי תמונות בענן',              icon: '☁️' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface WoofyProModalProps {
  visible: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const WoofyProModal: React.FC<WoofyProModalProps> = ({ visible, onClose }) => {
  const [plan, setPlan] = useState<Plan>('annual');
  const [showComparison, setShowComparison] = useState(false);
  const ctaAnim = useRef(new Animated.Value(1)).current;

  const monthlyPrice = 39;
  const annualTotal  = 199;
  const annualPerMonth = (annualTotal / 12).toFixed(0);
  const annualSaving = Math.round((1 - annualTotal / (monthlyPrice * 12)) * 100);

  const handleCTA = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(ctaAnim, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 4 }),
      Animated.spring(ctaAnim, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 6 }),
    ]).start(() => {
      Alert.alert(
        'Woofy Pro 🐾',
        'ניסיון חינמי ל-7 ימים הופעל!\nלאחר הניסיון: ' +
          (plan === 'annual'
            ? `₪${annualTotal} לשנה (₪${annualPerMonth} לחודש)`
            : `₪${monthlyPrice} לחודש`),
        [{ text: 'מעולה!', onPress: onClose }]
      );
    });
  };

  const handleTogglePlan = (p: Plan) => {
    Haptics.selectionAsync();
    setPlan(p);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom'] as any}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.proChip}>
            <WText style={styles.proChipText}>PRO</WText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* ── Hero ───────────────────────────────────── */}
          <LinearGradient
            colors={['#2C4A3E', '#1A2E28']}
            style={styles.hero}
          >
            <WText style={styles.crownEmoji}>👑</WText>
            <WText style={styles.heroTitle}>Woofy Pro</WText>
            <WText style={styles.heroSub}>
              חווית כלב מועדף — ללא פשרות
            </WText>
          </LinearGradient>

          {/* ── Pricing toggle ─────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.togglePill, plan === 'monthly' && styles.togglePillActive]}
                onPress={() => handleTogglePlan('monthly')}
                activeOpacity={0.8}
              >
                <WText style={[styles.toggleLabel, plan === 'monthly' && styles.toggleLabelActive]}>
                  חודשי
                </WText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.togglePill, plan === 'annual' && styles.togglePillActive]}
                onPress={() => handleTogglePlan('annual')}
                activeOpacity={0.8}
              >
                <WText style={[styles.toggleLabel, plan === 'annual' && styles.toggleLabelActive]}>
                  שנתי
                </WText>
                <View style={styles.savingBadge}>
                  <WText style={styles.savingBadgeText}>חיסכון {annualSaving}%</WText>
                </View>
              </TouchableOpacity>
            </View>

            {/* Price display */}
            <View style={styles.priceCard}>
              {plan === 'annual' ? (
                <>
                  <View style={styles.priceRow}>
                    <WText style={styles.priceCurrency}>₪</WText>
                    <WText style={styles.priceAmount}>{annualPerMonth}</WText>
                    <WText style={styles.pricePeriod}> / חודש</WText>
                  </View>
                  <WText style={styles.priceSubtext}>
                    חיוב שנתי: ₪{annualTotal} בלבד
                  </WText>
                  <View style={styles.oldPriceRow}>
                    <WText style={styles.oldPriceLabel}>במקום </WText>
                    <WText style={styles.oldPrice}>₪{monthlyPrice * 12}</WText>
                    <WText style={styles.oldPriceLabel}> לשנה</WText>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.priceRow}>
                    <WText style={styles.priceCurrency}>₪</WText>
                    <WText style={styles.priceAmount}>{monthlyPrice}</WText>
                    <WText style={styles.pricePeriod}> / חודש</WText>
                  </View>
                  <WText style={styles.priceSubtext}>חיוב חודשי, ניתן לביטול בכל עת</WText>
                </>
              )}
            </View>
          </View>

          {/* ── Pro features list ──────────────────────── */}
          <View style={styles.section}>
            <WText style={styles.sectionTitle}>מה כולל Woofy Pro?</WText>
            <View style={styles.featuresCard}>
              {PRO_FEATURES.map((f, i) => (
                <View
                  key={i}
                  style={[
                    styles.featureRow,
                    i < PRO_FEATURES.length - 1 && styles.featureRowBorder,
                  ]}
                >
                  <View style={styles.featureIconWrap}>
                    <WText style={styles.featureIcon}>{f.icon}</WText>
                  </View>
                  <WText style={styles.featureLabel}>{f.label}</WText>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                </View>
              ))}
            </View>
          </View>

          {/* ── Free vs Pro comparison toggle ─────────── */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.comparisonToggle}
              onPress={() => {
                Haptics.selectionAsync();
                setShowComparison(v => !v);
              }}
              activeOpacity={0.8}
            >
              <WText style={styles.comparisonToggleText}>
                {showComparison ? 'הסתר השוואה' : 'השוואה: חינמי מול Pro'}
              </WText>
              <Ionicons
                name={showComparison ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.terra}
              />
            </TouchableOpacity>

            {showComparison && (
              <View style={styles.comparisonCard}>
                {/* Table header */}
                <View style={[styles.compareRow, styles.compareHeader]}>
                  <WText style={[styles.compareFeatureLabel, styles.compareHeaderText]}>תכונה</WText>
                  <WText style={[styles.comparePlanLabel, styles.compareHeaderText]}>חינמי</WText>
                  <WText style={[styles.comparePlanLabel, styles.compareHeaderText]}>Pro</WText>
                </View>
                {FREE_FEATURES.map((f, i) => (
                  <View
                    key={i}
                    style={[styles.compareRow, i % 2 === 0 && styles.compareRowEven]}
                  >
                    <WText style={styles.compareFeatureLabel}>{f.label}</WText>
                    <View style={styles.comparePlanLabel}>
                      <Ionicons
                        name={f.included ? 'checkmark-circle' : 'close-circle'}
                        size={18}
                        color={f.included ? Colors.success : Colors.gray}
                      />
                    </View>
                    <View style={styles.comparePlanLabel}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Testimonials ───────────────────────────── */}
          <View style={styles.section}>
            <WText style={styles.sectionTitle}>מה אומרים חברי Pro?</WText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.testimonialsScroll}
            >
              {TESTIMONIALS.map((t, i) => (
                <View key={i} style={styles.testimonialCard}>
                  <WText style={styles.testimonialEmoji}>{t.dogEmoji}</WText>
                  <WText style={styles.testimonialQuote}>"{t.quote}"</WText>
                  <WText style={styles.testimonialAuthor}>— {t.name}</WText>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Ionicons key={s} name="star" size={12} color={Colors.yellow} />
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ── Trust badges ───────────────────────────── */}
          <View style={styles.trustRow}>
            {TRUST_BADGES.map((b, i) => (
              <View key={i} style={styles.trustBadge}>
                <WText style={styles.trustBadgeEmoji}>{b.emoji}</WText>
                <WText style={styles.trustBadgeLabel}>{b.label}</WText>
              </View>
            ))}
          </View>

          {/* ── CTA ────────────────────────────────────── */}
          <View style={styles.ctaSection}>
            <Animated.View style={{ transform: [{ scale: ctaAnim }] }}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleCTA}
                activeOpacity={0.9}
              >
                <WText style={styles.ctaButtonText}>
                  התחל ניסיון חינמי — 7 ימים 🐾
                </WText>
              </TouchableOpacity>
            </Animated.View>

            <WText style={styles.ctaDisclaimer}>
              לא נדרש כרטיס אשראי לניסיון • ניתן לביטול בכל עת
            </WText>

            <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
              <WText style={styles.laterBtnText}>אולי אחר כך</WText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Static data ──────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { dogEmoji: '🐕', name: 'לונה & אורי, תל אביב',     quote: 'מאז Pro מצאנו 3 חברים חדשים לטיולים!' },
  { dogEmoji: '🐩', name: 'מקס & שירה, חיפה',         quote: 'תג המאומת נתן לנו הרבה יותר פניות.' },
  { dogEmoji: '🦮', name: 'בלה & יוסף, ירושלים',      quote: 'האירועים הבלעדיים שווים את המחיר לבד.' },
  { dogEmoji: '🐶', name: 'ריילי & תמר, רמת גן',      quote: 'הסטטיסטיקות עזרו לי להבין מה עובד.' },
];

const TRUST_BADGES = [
  { emoji: '🔒', label: 'פרטיות מלאה' },
  { emoji: '⚡', label: 'ביטול מיידי' },
  { emoji: '🛡️', label: 'תשלום מאובטח' },
  { emoji: '📱', label: 'כל הפלטפורמות' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.forest },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.forest,
  },

  proChip: {
    backgroundColor: Colors.terra,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    paddingVertical: 4,
  },
  proChipText: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize.sm,
    color: Colors.white,
    letterSpacing: 2,
  },

  scrollContent: { paddingBottom: 40 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  crownEmoji: { fontSize: 56, marginBottom: Spacing.sm },
  heroTitle: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 34,
    color: Colors.white,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  heroSub: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  // Content sections
  section: {
    backgroundColor: Colors.cream,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.forest,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },

  // Pricing toggle
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  togglePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.medium - 2,
    gap: Spacing.xs,
  },
  togglePillActive: {
    backgroundColor: Colors.white,
    ...Shadow.soft,
  },
  toggleLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.gray,
  },
  toggleLabelActive: {
    fontFamily: FontFamily.bold,
    color: Colors.forest,
  },
  savingBadge: {
    backgroundColor: Colors.terra,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  savingBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: Colors.white,
  },

  // Price card
  priceCard: {
    backgroundColor: Colors.forestDim,
    borderRadius: Radius.medium,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.forest + '33',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceCurrency: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.forest,
    marginBottom: 6,
  },
  priceAmount: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 52,
    color: Colors.forest,
    lineHeight: 58,
  },
  pricePeriod: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: Colors.gray,
    marginBottom: 10,
  },
  priceSubtext: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: Spacing.xs,
  },
  oldPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  oldPriceLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  oldPrice: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.gray,
    textDecorationLine: 'line-through',
  },

  // Pro features card
  featuresCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.medium,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  featureRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: { fontSize: 18 },
  featureLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'right',
  },

  // Comparison
  comparisonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  comparisonToggleText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.terra,
  },
  comparisonCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.medium,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  compareHeader: {
    backgroundColor: Colors.forest,
  },
  compareRowEven: {
    backgroundColor: Colors.cream2,
  },
  compareHeaderText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  compareFeatureLabel: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.text,
    textAlign: 'right',
  },
  comparePlanLabel: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.text,
  },

  // Testimonials
  testimonialsScroll: {
    paddingRight: Spacing.base,
    gap: Spacing.md,
  },
  testimonialCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: Radius.medium,
    padding: Spacing.base,
    ...Shadow.soft,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  testimonialEmoji: { fontSize: 36 },
  testimonialQuote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },

  // Trust badges
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.cream,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  trustBadge: { alignItems: 'center', gap: Spacing.xs },
  trustBadgeEmoji: { fontSize: 28 },
  trustBadgeLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'center',
  },

  // CTA
  ctaSection: {
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
    gap: Spacing.md,
  },
  ctaButton: {
    backgroundColor: Colors.terra,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.base + 2,
    ...Shadow.medium,
    minWidth: 280,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize.md,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  ctaDisclaimer: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'center',
  },
  laterBtn: { paddingVertical: Spacing.sm },
  laterBtnText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.gray,
    textDecorationLine: 'underline',
  },
});
