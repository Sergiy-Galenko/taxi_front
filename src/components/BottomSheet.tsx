import React, { memo, ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePassengerTheme } from '../hooks/usePassengerTheme';
import {
  PassengerPalette,
  passengerLayout,
  passengerShadows,
  passengerSpacing,
} from '../theme/passenger';

interface BottomSheetProps {
  children: ReactNode;
  footer?: ReactNode;
  bottomOffset?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

function BottomSheet({
  children,
  footer,
  bottomOffset = 0,
  style,
  contentStyle,
}: BottomSheetProps) {
  const { palette, radius } = usePassengerTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(palette, radius), [palette, radius]);
  const translateY = useRef(new Animated.Value(26)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        duration: 260,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        duration: 220,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const effectiveBottom = keyboardHeight > 0 ? Math.max(keyboardHeight - insets.bottom, 0) + 8 : bottomOffset;

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          bottom: effectiveBottom,
          opacity,
          paddingBottom: Math.max(insets.bottom, 10),
          transform: [{ translateY }],
        },
        style,
        keyboardHeight > 0 && styles.keyboardSheet,
      ]}
    >
      <View style={styles.handle} />
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </Animated.View>
  );
}

const createStyles = (
  palette: PassengerPalette,
  radius: typeof import('../theme/passenger').passengerRadius
) =>
  StyleSheet.create({
    content: {
      gap: passengerSpacing.lg,
    },
    footer: {
      marginTop: passengerSpacing.lg,
    },
    handle: {
      alignSelf: 'center',
      backgroundColor: palette.borderStrong,
      borderRadius: radius.pill,
      height: 4,
      marginBottom: passengerSpacing.lg,
      width: 42,
    },
    sheet: {
      backgroundColor: palette.backgroundSecondary,
      borderTopLeftRadius: passengerLayout.bottomSheetRadius,
      borderTopRightRadius: passengerLayout.bottomSheetRadius,
      left: 0,
      paddingHorizontal: passengerSpacing.xl,
      paddingTop: passengerSpacing.md,
      position: 'absolute',
      right: 0,
      shadowColor: palette.shadow,
      ...passengerShadows.sheet,
    },
    keyboardSheet: {
      maxHeight: '64%',
    },
  });

export default memo(BottomSheet);
