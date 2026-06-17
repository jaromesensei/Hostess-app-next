import React from 'react';
import { Text as RNText, TextProps, StyleSheet, I18nManager } from 'react-native';
import { Colors, FontFamily, FontSize } from '@/theme';

// Enable RTL globally (Hebrew)
I18nManager.allowRTL(true);

type Variant =
  | 'display'        // Nunito 900, 40px
  | 'h1'             // Nunito 900, 34px
  | 'h2'             // Nunito 900, 28px
  | 'h3'             // Nunito 800, 24px
  | 'h4'             // Nunito 800, 20px
  | 'title'          // Inter 700, 17px
  | 'body'           // Inter 400, 15px
  | 'bodyMedium'     // Inter 500, 15px
  | 'bodySemibold'   // Inter 600, 15px
  | 'caption'        // Inter 400, 13px
  | 'captionMedium'  // Inter 500, 13px
  | 'label'          // Inter 600, 11px uppercase
  ;

interface WoofyTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
  right?: boolean;
}

export const WText: React.FC<WoofyTextProps> = ({
  variant = 'body',
  color,
  center,
  right,
  style,
  ...props
}) => {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        color ? { color } : undefined,
        center ? { textAlign: 'center' } : undefined,
        right ? { textAlign: 'right' } : undefined,
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    color: Colors.text,
    writingDirection: 'rtl',
  },
  display: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['4xl'],
    lineHeight: FontSize['4xl'] * 1.15,
  },
  h1: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'] * 1.2,
  },
  h2: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    lineHeight: FontSize['2xl'] * 1.2,
  },
  h3: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * 1.25,
  },
  h4: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * 1.3,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.4,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.6,
  },
  bodyMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.6,
  },
  bodySemibold: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.5,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.6,
  },
  captionMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.6,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
