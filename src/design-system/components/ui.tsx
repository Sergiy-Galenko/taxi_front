import React, { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDesign } from "../hooks/useDesign";
import { useAdaptiveLayout } from "../hooks/useAdaptiveLayout";
import {
  Colors,
  elevations,
  layout,
  radii,
  space,
  typography,
} from "../tokens";
import { useI18n } from "../../hooks/useI18n";
export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export function AppText({
  variant = "body",
  tone = "text",
  style,
  ...props
}: TextProps & { variant?: keyof typeof typography; tone?: keyof Colors }) {
  const { colors } = useDesign();
  return (
    <Text
      {...props}
      style={[
        typography[variant],
        { color: colors[tone], flexShrink: 1 },
        style,
      ]}
    />
  );
}
export function AppIcon({
  name,
  size = 22,
  tone = "text",
}: {
  name: IconName;
  size?: number;
  tone?: keyof Colors;
}) {
  const { colors } = useDesign();
  return (
    <Ionicons accessible={false} name={name} size={size} color={colors[tone]} />
  );
}
export function AppButton({
  label,
  icon,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  ...props
}: Omit<PressableProps, "style" | "children"> & {
  label: string;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useDesign();
  const [focused, setFocused] = useState(false);
  const inactive = disabled || loading;
  const choice = props.accessibilityState?.selected;
  const role =
    props.accessibilityRole ?? (choice !== undefined ? "radio" : "button");
  const foreground = inactive
    ? colors.onDisabled
    : variant === "primary"
      ? colors.onPrimary
      : variant === "danger"
        ? colors.danger
        : colors.text;
  return (
    <Pressable
      {...props}
      accessibilityRole={role}
      aria-checked={role === "radio" ? choice : undefined}
      aria-busy={loading}
      aria-disabled={inactive}
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{
        ...props.accessibilityState,
        selected: role === "radio" ? undefined : choice,
        checked: role === "radio" ? choice : props.accessibilityState?.checked,
        disabled: inactive,
        busy: loading,
      }}
      disabled={inactive}
      onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
      onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: inactive
            ? colors.disabled
            : variant === "primary"
              ? pressed
                ? colors.primaryPressed
                : colors.primary
              : variant === "secondary"
                ? colors.inset
                : colors.transparent,
          borderColor: focused ? colors.focus : colors.transparent,
          opacity: pressed && variant !== "primary" ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityLabel={label}
          color={foreground}
          size="small"
        />
      ) : icon ? (
        <Ionicons accessible={false} name={icon} size={20} color={foreground} />
      ) : null}
      <AppText
        style={{ color: foreground, fontWeight: "600", textAlign: "center" }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
export interface AppInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  hint?: string;
  icon?: IconName;
}
export function AppInput({
  label,
  error,
  hint,
  icon,
  secureTextEntry,
  style,
  ...props
}: AppInputProps) {
  const { colors } = useDesign();
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: space.sm }}>
      <AppText variant="secondary" style={{ fontWeight: "600" }}>
        {label}
      </AppText>
      <View
        style={[
          styles.inputFrame,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.danger
              : focused
                ? colors.focus
                : colors.border,
            borderWidth: focused ? 2 : 1,
          },
        ]}
      >
        {icon ? (
          <AppIcon
            name={icon}
            tone={focused ? "primary" : "secondary"}
            size={20}
          />
        ) : null}
        <TextInput
          {...props}
          accessibilityLabel={props.accessibilityLabel ?? label}
          accessibilityHint={error ? t(error) : hint}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry && !visible}
          autoCorrect={props.autoCorrect ?? false}
          selectionColor={colors.primary}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={[typography.body, styles.input, { color: colors.text }, style]}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(
              visible
                ? "accessibility.hidePassword"
                : "accessibility.showPassword",
            )}
            onPress={() => setVisible((value) => !value)}
            style={styles.inputAction}
          >
            <AppIcon
              name={visible ? "eye-off-outline" : "eye-outline"}
              tone="secondary"
              size={20}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          variant="secondary"
          tone="danger"
        >
          {t(error)}
        </AppText>
      ) : hint ? (
        <AppText variant="secondary" tone="secondary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
export const FormField = AppInput;
export function AppCard({
  children,
  style,
  onPress,
  selected,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  selected?: boolean;
  accessibilityLabel?: string;
}) {
  const { colors } = useDesign();
  const [focused, setFocused] = useState(false);
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: selected ? colors.primarySoft : colors.surface,
      borderColor: selected || focused ? colors.primary : colors.border,
    },
    style,
  ];
  return onPress ? (
    <Pressable
      accessibilityRole={selected !== undefined ? "radio" : "button"}
      aria-checked={selected}
      accessibilityState={
        selected !== undefined ? { checked: selected } : undefined
      }
      accessibilityLabel={accessibilityLabel}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.8 : 1 }]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={cardStyle}>{children}</View>
  );
}
export function AppHeader({
  title,
  subtitle,
  eyebrow,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <View style={styles.header}>
      {onBack ? (
        <MapControlButton
          icon="arrow-back"
          label={t("accessibility.back")}
          onPress={onBack}
        />
      ) : null}
      <View style={{ flex: 1, gap: space.xs }}>
        {eyebrow ? (
          <AppText variant="caption" tone="primary">
            {eyebrow}
          </AppText>
        ) : null}
        <AppText accessibilityRole="header" variant="title">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="secondary" tone="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}
export function MapControlButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useDesign();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.control,
        elevations.raised,
        {
          shadowColor: colors.shadow,
          borderColor: focused ? colors.focus : colors.border,
          backgroundColor: colors.surface,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <AppIcon name={icon} />
    </Pressable>
  );
}
export function ScreenContainer({
  children,
  scroll = false,
  style,
}: {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, isDark } = useDesign();
  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.page, style]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, style]}>{children}</View>
        )}
      </SafeAreaView>
    </>
  );
}
export function ResponsiveGrid({
  children,
  minColumnWidth = 300,
}: {
  children: ReactNode;
  minColumnWidth?: number;
}) {
  const { usableWidth, gutter, rail, fontScale } = useAdaptiveLayout();
  const columns =
    (usableWidth - (rail ? layout.rail : 0) - gutter * 2) /
      Math.max(1, fontScale) >=
    minColumnWidth * 2 + space.xl
      ? 2
      : 1;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xl }}>
      {React.Children.toArray(children).map((child, index) => (
        <View
          key={React.isValidElement(child) ? (child.key ?? index) : index}
          style={{
            flexBasis: columns === 2 ? "47%" : "100%",
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}
export type StateTone = "neutral" | "warning" | "danger" | "success";
export function StatePanel({
  icon = "information-circle-outline",
  title,
  description,
  tone = "neutral",
  action,
}: {
  icon?: IconName;
  title: string;
  description: string;
  tone?: StateTone;
  action?: ReactNode;
}) {
  const { colors } = useDesign();
  const color = tone === "neutral" ? "primary" : tone;
  const surface =
    tone === "neutral" ? colors.primarySoft : colors[`${tone}Soft`];
  return (
    <AppCard>
      <View style={[styles.stateIcon, { backgroundColor: surface }]}>
        <AppIcon name={icon} tone={color} size={24} />
      </View>
      <AppText accessibilityRole="header" variant="card">
        {title}
      </AppText>
      <AppText accessibilityRole={tone === "danger" ? "alert" : undefined} accessibilityLiveRegion={tone === "danger" ? "polite" : undefined} tone="secondary" variant="secondary">
        {description}
      </AppText>
      {action}
    </AppCard>
  );
}
export function LoadingState({ label }: { label: string }) {
  const { colors } = useDesign();
  return (
    <View accessibilityLiveRegion="polite" style={styles.loading}>
      <ActivityIndicator color={colors.primary} accessibilityLabel={label} />
      <AppText tone="secondary" variant="secondary">
        {label}
      </AppText>
    </View>
  );
}
export function EmptyState(props: React.ComponentProps<typeof StatePanel>) {
  return <StatePanel icon="file-tray-outline" {...props} />;
}
export function ErrorState(props: React.ComponentProps<typeof StatePanel>) {
  return <StatePanel icon="cloud-offline-outline" tone="danger" {...props} />;
}
export function TripStatusBadge({
  label,
  icon = "ellipse-outline",
  tone = "neutral",
}: {
  label: string;
  icon?: IconName;
  tone?: StateTone;
}) {
  const { colors } = useDesign();
  const color = tone === "neutral" ? "secondary" : tone;
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            tone === "neutral" ? colors.inset : colors[`${tone}Soft`],
        },
      ]}
    >
      <AppIcon name={icon} tone={color} size={16} />
      <AppText variant="caption" tone={color}>
        {label}
      </AppText>
    </View>
  );
}
export function ProgressIndicator({
  current,
  total = 6,
  label,
}: {
  current: number;
  total?: number;
  label: string;
}) {
  const { colors } = useDesign();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: total, now: current }}
      style={{ gap: space.md }}
    >
      <View style={{ flexDirection: "row", gap: space.xs }}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 3,
              borderRadius: radii.pill,
              backgroundColor: index < current ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
      <AppText variant="caption" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}
export function ConfirmationDialog({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
}: {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const { colors } = useDesign();
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={[styles.modal, { backgroundColor: colors.scrim }]}>
        <View
          accessibilityViewIsModal
          style={{ width: "100%", maxWidth: layout.formMax }}
        >
          <AppCard>
            <AppText accessibilityRole="header" variant="section">
              {title}
            </AppText>
            <AppText tone="secondary">{description}</AppText>
            <AppButton
              label={confirmLabel}
              loading={busy}
              onPress={onConfirm}
            />
            <AppButton
              label={cancelLabel}
              variant="ghost"
              disabled={busy}
              onPress={onCancel}
            />
          </AppCard>
        </View>
      </View>
    </Modal>
  );
}
export function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={{ gap: space.xs }}>
      <AppText accessibilityRole="header" variant="section">
        {title}
      </AppText>
      {detail ? (
        <AppText tone="secondary" variant="secondary">
          {detail}
        </AppText>
      ) : null}
    </View>
  );
}
export function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: IconName;
}) {
  return (
    <View
      style={{ flexDirection: "row", gap: space.md, alignItems: "flex-start" }}
    >
      {icon ? <AppIcon name={icon} tone="secondary" size={20} /> : null}
      <View style={{ flex: 1, gap: space.xs }}>
        <AppText variant="caption" tone="secondary">
          {label}
        </AppText>
        <AppText>{value}</AppText>
      </View>
    </View>
  );
}
export const pageStyles = StyleSheet.create({
  content: {
    padding: space.xl,
    gap: space.xxl,
    width: "100%",
    maxWidth: layout.contentMax,
    alignSelf: "center",
  },
  form: { gap: space.xl },
  row: { flexDirection: "row", alignItems: "center", gap: space.md },
});
const styles = StyleSheet.create({
  button: {
    minHeight: layout.touch,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radii.md,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  inputFrame: {
    minHeight: 56,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: space.lg,
    paddingRight: space.sm,
    gap: space.md,
  },
  input: { flex: 1, minWidth: 0, paddingVertical: space.lg },
  inputAction: {
    minWidth: layout.touch,
    minHeight: layout.touch,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    padding: space.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: space.md,
    minWidth: 0,
  },
  header: {
    flexDirection: "row",
    gap: space.lg,
    padding: space.xl,
    alignItems: "flex-start",
  },
  control: {
    width: layout.touch,
    minHeight: layout.touch,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  page: { flexGrow: 1, padding: space.xl, gap: space.xxl },
  stateIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    padding: space.xxl,
    flexDirection: "row",
    gap: space.md,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.sm,
  },
  modal: {
    flex: 1,
    padding: space.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
});
