import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { AppButton, AppInput } from "../src/design-system/components/ui";
import { darkColors, lightColors } from "../src/design-system/tokens";
import { uiMessages } from "../src/i18n/uiMessages";
jest.mock("../src/hooks/useTheme", () => ({
  useTheme: () => ({ isDark: false }),
}));
jest.mock("../src/hooks/useI18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
function luminance(hex: string) {
  const rgb =
    hex
      .slice(1)
      .match(/.{2}/g)
      ?.map((part) => parseInt(part, 16) / 255)
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      ) ?? [];
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test.each([lightColors, darkColors])(
  "semantic foreground pairs meet 4.5:1 text contrast",
  (colors) => {
    for (const [foreground, background] of [
      [colors.text, colors.surface],
      [colors.secondary, colors.surface],
      [colors.secondary, colors.inset],
      [colors.onPrimary, colors.primary],
      [colors.danger, colors.dangerSoft],
      [colors.success, colors.successSoft],
      [colors.warning, colors.warningSoft],
    ])
      expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  },
);
test("password visibility is accessible and preserves entered value", () => {
  render(<AppInput label="Password" value="private draft" secureTextEntry />);
  expect(screen.getByLabelText("Password").props.secureTextEntry).toBe(true);
  fireEvent.press(screen.getByLabelText("accessibility.showPassword"));
  expect(screen.getByLabelText("Password").props.secureTextEntry).toBe(false);
  expect(screen.getByLabelText("Password").props.value).toBe("private draft");
});
test("busy buttons cannot submit twice and expose busy state", () => {
  const onPress = jest.fn();
  render(<AppButton label="Continue" loading onPress={onPress} />);
  fireEvent.press(screen.getByRole("button", { name: "Continue" }));
  expect(onPress).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "Continue" }).props.accessibilityState
      .busy,
  ).toBe(true);
});
test("redesign dictionaries are complete in both languages", () => {
  expect(Object.keys(uiMessages.en).sort()).toEqual(
    Object.keys(uiMessages.uk).sort(),
  );
});
