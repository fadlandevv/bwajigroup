import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CustomerSession = {
  id: string;
  name: string;
  phone: string;
  address: string;
  avatar: string | null;
};

type CustomerStore = {
  customer: CustomerSession | null;
  setCustomer: (c: CustomerSession) => void;
  clearCustomer: () => void;
};

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (c) => set({ customer: c }),
      clearCustomer: () => set({ customer: null }),
    }),
    { name: "bwaji-customer" }
  )
);
