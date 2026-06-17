import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Platform,
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

type NavProp = NativeStackNavigationProp<OnboardingStackParamList>;

export const OnboardingStep1: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { setOwner } = useApp();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      setNameError('אנא הכנס את שמך');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setNameError('');
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOwner(name.trim(), city.trim(), photo);
    setLoading(false);
    navigation.navigate('Step2');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom'] as any}>
      {/* Progress bar — rendered above everything in forest bg */}
      <View style={styles.progressWrap}>
        <ProgressBar current={1} total={5} />
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
                קצת עליך
              </WText>
              <WText style={styles.subtext} color="rgba(255,255,255,0.8)">
                כדי שנוכל להתאים את החוויה לך
              </WText>
            </View>

            {/* Cream form card */}
            <View style={styles.formSection}>
              {/* Profile photo */}
              <View style={styles.photoRow}>
                <TouchableOpacity
                  onPress={pickPhoto}
                  style={styles.photoCircle}
                  activeOpacity={0.8}
                >
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                  ) : (
                    <Ionicons name="person" size={40} color={Colors.gray} />
                  )}
                  <View style={styles.cameraOverlay}>
                    <Ionicons name="camera" size={16} color={Colors.white} />
                  </View>
                </TouchableOpacity>
                <WText
                  variant="caption"
                  color={Colors.gray}
                  style={styles.photoHint}
                >
                  הוסף תמונת פרופיל
                </WText>
              </View>

              {/* Inputs */}
              <View style={styles.inputsWrap}>
                <WInput
                  label="שם פרטי"
                  placeholder="איך קוראים לך?"
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (t.trim()) setNameError('');
                  }}
                  error={nameError}
                  returnKeyType="next"
                  autoCapitalize="words"
                />

                <View style={styles.inputGap} />

                <WInput
                  label="עיר"
                  placeholder="באיזו עיר אתה גר?"
                  value={city}
                  onChangeText={setCity}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
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
  progressWrap: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
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
    flex: 1,
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    marginTop: -(Radius.large),
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  photoRow: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
    overflow: 'hidden',
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  photoHint: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  inputsWrap: {
    gap: 0,
  },
  inputGap: {
    height: Spacing.base,
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
