import React, { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppHeader, ScreenContainer } from "../../design-system/components/ui";
import { layout, space } from "../../design-system/tokens";
export default function BookingFlowLayout({
  title,
  subtitle,
  children,
  footer,
  rightAction,
  contentStyle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  rightAction?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  onBack?: () => void;
}) {
  const navigation = useNavigation();
  return (
    <ScreenContainer>
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: layout.contentMax,
          alignSelf: "center",
        }}
      >
        <AppHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack ?? (() => navigation.goBack())}
          right={rightAction}
        />
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
        {footer ? (
          <View style={{ padding: space.xl, paddingTop: space.md }}>
            {footer}
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
