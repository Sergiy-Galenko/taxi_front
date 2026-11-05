import { layout } from "./tokens";
export type WindowClass = "compact" | "medium" | "expanded";
export function windowLayout(
  width: number,
  height: number,
  fontScale = 1,
  horizontalInsets = 0,
) {
  const usableWidth = Math.max(0, width - horizontalInsets);
  const sizeClass: WindowClass =
    usableWidth < layout.compact
      ? "compact"
      : usableWidth < layout.expanded
        ? "medium"
        : "expanded";
  const sidePanel =
    (sizeClass === "expanded" || (sizeClass === "medium" && (usableWidth >= 700 || height < 600))) &&
    usableWidth / Math.max(1, fontScale * 0.8) >= 680;
  const rail =
    sizeClass === "expanded" &&
    usableWidth / Math.max(1, fontScale * 0.75) >= 760;
  const available = usableWidth - (rail ? layout.rail : 0);
  const panelWidth = Math.min(
    layout.panelMax,
    Math.max(layout.panelMin, available * 0.36),
    available * 0.54,
  );
  return {
    sizeClass,
    sidePanel,
    rail,
    panelWidth,
    usableWidth,
    short: height < 600,
    gutter: sizeClass === "compact" ? 20 : 32,
  };
}
export type SheetPosition = "collapsed" | "partial" | "expanded";
export function sheetStops(
  height: number,
  fontScale = 1,
): Record<SheetPosition, number> {
  const available = Math.max(0, height);
  const max = Math.max(0, available - Math.min(100, available * 0.2));
  const collapsed = Math.min(max, 180 * Math.max(1, Math.min(fontScale, 1.6)));
  return {
    collapsed,
    partial: Math.min(max, Math.max(collapsed, available * 0.56)),
    expanded: max,
  };
}
