import React from "react";
import { act, renderHook } from "@testing-library/react-native";
import {
  DriverDraftProvider,
  useDriverDraft,
} from "../src/features/auth/DriverDraft";
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DriverDraftProvider>{children}</DriverDraftProvider>
);
test("wizard draft preserves entered stages and clears after registration without storing a password", () => {
  const { result, rerender } = renderHook(useDriverDraft, { wrapper });
  act(() =>
    result.current.update({
      fullName: "Review Driver",
      email: "review@example.test",
      carBrand: "Toyota",
    }),
  );
  rerender({});
  expect(result.current.draft.fullName).toBe("Review Driver");
  expect(result.current.draft.carBrand).toBe("Toyota");
  expect(result.current.draft).not.toHaveProperty("password");
  act(() => result.current.clear());
  expect(result.current.draft.fullName).toBe("");
});
