import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';

type Step = 'phone' | 'otp' | 'done';

interface Props {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const PhoneVerificationModal: React.FC<Props> = ({ visible, onClose, onVerified }) => {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setStep('phone');
      setPhone('');
      setOtp('');
      setLoading(false);
    }
  }, [visible]);

  useEffect(() => {
    if (step === 'done') {
      successScale.setValue(0);
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 14 }).start();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const t = setTimeout(() => { onVerified(); onClose(); }, 1600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleSendCode = () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9) {
      Alert.alert('מספר לא תקין', 'אנא הזן מספר טלפון ישראלי תקין');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      Alert.alert('קוד לא תקין', 'אנא הזן את הקוד בן 6 הספרות');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('done');
    }, 900);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom'] as any}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <WText style={styles.headerTitle}>אימות טלפון</WText>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.body}>
            {step === 'done' ? (
              /* ── Done ── */
              <View style={styles.doneWrap}>
                <Animated.View style={[styles.doneCircle, { transform: [{ scale: successScale }] }]}>
                  <Ionicons name="checkmark" size={44} color={Colors.white} />
                </Animated.View>
                <WText style={styles.doneTitle}>מספר אומת בהצלחה</WText>
                <WText style={styles.doneSub}>הפרופיל שלך מאומת כעת</WText>
              </View>
            ) : step === 'otp' ? (
              /* ── OTP step ── */
              <>
                <View style={styles.iconCircle}>
                  <Ionicons name="chatbubble-outline" size={32} color={Colors.forest} />
                </View>
                <WText style={styles.title}>הזן קוד אימות</WText>
                <WText style={styles.sub}>שלחנו קוד בן 6 ספרות למספר {phone}</WText>

                <TextInput
                  style={styles.otpInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="000000"
                  placeholderTextColor={Colors.cream2}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  textAlign="center"
                />

                <TouchableOpacity
                  style={[styles.btn, (otp.length < 4 || loading) && styles.btnDisabled]}
                  onPress={handleVerifyOtp}
                  activeOpacity={0.85}
                  disabled={otp.length < 4 || loading}
                >
                  {loading ? (
                    <WText style={styles.btnText}>מאמת...</WText>
                  ) : (
                    <WText style={styles.btnText}>אמת קוד</WText>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendRow} onPress={() => { setStep('phone'); setOtp(''); }}>
                  <WText style={styles.resendText}>לא קיבלת קוד? שנה מספר</WText>
                </TouchableOpacity>
              </>
            ) : (
              /* ── Phone step ── */
              <>
                <View style={styles.iconCircle}>
                  <Ionicons name="phone-portrait-outline" size={32} color={Colors.forest} />
                </View>
                <WText style={styles.title}>אמת את מספר הטלפון שלך</WText>
                <WText style={styles.sub}>פרופילים מאומתים זוכים לאמון רב יותר בקהילה</WText>

                <View style={styles.inputWrap}>
                  <WText style={styles.prefix}>+972</WText>
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="050 000 0000"
                    placeholderTextColor={Colors.gray}
                    keyboardType="phone-pad"
                    maxLength={13}
                    autoFocus
                    textAlign="right"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btn, (!phone || loading) && styles.btnDisabled]}
                  onPress={handleSendCode}
                  activeOpacity={0.85}
                  disabled={!phone || loading}
                >
                  {loading ? (
                    <WText style={styles.btnText}>שולח...</WText>
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color={Colors.white} />
                      <WText style={styles.btnText}>שלח קוד</WText>
                    </>
                  )}
                </TouchableOpacity>

                <WText style={styles.privacyNote}>
                  מספר הטלפון שלך לא יוצג לאחרים
                </WText>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.base,
  },

  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.forestDim,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: { fontFamily: FontFamily.displayBlack, fontSize: FontSize['2xl'], color: Colors.forest, textAlign: 'center' },
  sub:   { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    height: 52,
    width: '100%',
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  prefix: { fontFamily: FontFamily.semibold, fontSize: FontSize.base, color: Colors.text },
  phoneInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.text,
    height: 52,
  },

  otpInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    height: 56,
    fontFamily: FontFamily.displayBlack,
    fontSize: 28,
    color: Colors.forest,
    letterSpacing: 12,
    ...Shadow.sm,
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.forest,
    ...Shadow.md,
    marginTop: Spacing.sm,
  },
  btnDisabled: { backgroundColor: Colors.cream2 },
  btnText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.white },

  resendRow: { marginTop: Spacing.xs },
  resendText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.terra },

  privacyNote: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  // Done state
  doneWrap: { alignItems: 'center', gap: Spacing.base },
  doneCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.success,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  doneTitle: { fontFamily: FontFamily.displayBlack, fontSize: FontSize['2xl'], color: Colors.forest },
  doneSub:   { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary },
});
