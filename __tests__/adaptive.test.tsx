import React, { useState } from "react";
import { TextInput, View } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { sheetStops, windowLayout } from "../src/design-system/adaptive";
import { AdaptiveScreen } from "../src/design-system/components/AdaptiveScreen";
let mockLayout = { sidePanel: false, panelWidth: 360 };
jest.mock("../src/design-system/hooks/useAdaptiveLayout", () => ({
  useAdaptiveLayout: () => mockLayout,
}));
const matrix = [
  [320, 640, "compact"],
  [360, 780, "compact"],
  [390, 844, "compact"],
  [412, 915, "compact"],
  [480, 800, "compact"],
  [600, 960, "medium"],
  [720, 900, "medium"],
  [840, 1100, "expanded"],
  [1024, 768, "expanded"],
  [1280, 800, "expanded"],
] as const;
test.each(matrix)(
  "window policy %sx%s uses %s with bounded panels and sheet",
  (width, height, sizeClass) => {
    const layout = windowLayout(width, height);
    expect(layout.sizeClass).toBe(sizeClass);
    if (layout.sidePanel) {
      expect(layout.panelWidth).toBeGreaterThanOrEqual(340);
      expect(layout.panelWidth).toBeLessThanOrEqual(440);
      expect(
        layout.usableWidth - layout.panelWidth - (layout.rail ? 88 : 0),
      ).toBeGreaterThan(300);
    }
    const stops = sheetStops(height - 120);
    expect(stops.collapsed).toBeLessThanOrEqual(stops.partial);
    expect(stops.partial).toBeLessThanOrEqual(stops.expanded);
    expect(stops.expanded).toBeLessThan(height - 120);
  },
);
test("short medium landscape uses side panel; large text can fall back to a single pane", () => {
  expect(windowLayout(720, 360).sidePanel).toBe(true);
  expect(windowLayout(840, 1100, 2).sidePanel).toBe(false);
  expect(windowLayout(840, 1100, 2).rail).toBe(false);
  expect(windowLayout(620, 900, 1, 40).sizeClass).toBe("compact");
});
function DraftField() {
  const [value, setValue] = useState("");
  return (
    <TextInput
      accessibilityLabel="Draft"
      value={value}
      onChangeText={setValue}
    />
  );
}
test("fold/unfold changes composition without remounting input state", () => {
  mockLayout = { sidePanel: false, panelWidth: 360 };
  const view = render(<AdaptiveScreen panel={<DraftField />} map={<View />} />);
  fireEvent.changeText(screen.getByLabelText("Draft"), "Unsubmitted address");
  mockLayout = { sidePanel: true, panelWidth: 440 };
  view.rerender(<AdaptiveScreen panel={<DraftField />} map={<View />} />);
  expect(screen.getByLabelText("Draft").props.value).toBe(
    "Unsubmitted address",
  );
  mockLayout = { sidePanel: false, panelWidth: 360 };
  view.rerender(<AdaptiveScreen panel={<DraftField />} map={<View />} />);
  expect(screen.getByLabelText("Draft").props.value).toBe(
    "Unsubmitted address",
  );
});
