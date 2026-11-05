import React, { createContext, useContext, useMemo, useState } from "react";
export interface DriverDraft {
  fullName: string;
  email: string;
  phone: string;
  carBrand: string;
  carModel: string;
  carColor: string;
  carNumber: string;
  yearsOfExperience: string;
  licenseNumber: string;
}
const initial: DriverDraft = {
  fullName: "",
  email: "",
  phone: "",
  carBrand: "",
  carModel: "",
  carColor: "",
  carNumber: "",
  yearsOfExperience: "",
  licenseNumber: "",
};
const Context = createContext<{
  draft: DriverDraft;
  update: (patch: Partial<DriverDraft>) => void;
  clear: () => void;
} | null>(null);
export function DriverDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState(initial);
  const value = useMemo(
    () => ({
      draft,
      update: (patch: Partial<DriverDraft>) =>
        setDraft((value) => ({ ...value, ...patch })),
      clear: () => setDraft(initial),
    }),
    [draft],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useDriverDraft() {
  const value = useContext(Context);
  if (!value) throw new Error("Driver draft provider required");
  return value;
}
