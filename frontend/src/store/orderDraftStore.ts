import { create } from 'zustand';
import type { DeliveryType, PaymentMethod } from '@/types';

interface OrderDraftState {
  designId: string | null;
  fabricId: string | null;
  optionIds: string[];
  measurementId: string | null;
  quantity: number;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  notes: string;
  referencePhotoUrl: string | null;
  offeredPrice: string;
  setField: <K extends keyof Omit<OrderDraftState, 'setField' | 'toggleOption' | 'reset'>>(
    key: K,
    value: OrderDraftState[K],
  ) => void;
  toggleOption: (optionId: string) => void;
  reset: () => void;
}

const initialDraft: Omit<
  OrderDraftState,
  'setField' | 'toggleOption' | 'reset'
> = {
  designId: null,
  fabricId: null,
  optionIds: [],
  measurementId: null,
  quantity: 1,
  deliveryType: 'DELIVERY',
  paymentMethod: 'COD',
  notes: '',
  referencePhotoUrl: null,
  offeredPrice: '',
};

export const useOrderDraftStore = create<OrderDraftState>()((set) => ({
  ...initialDraft,

  setField: (key, value) => set({ [key]: value } as Partial<OrderDraftState>),

  toggleOption: (optionId) =>
    set((state) => {
      const exists = state.optionIds.includes(optionId);
      return {
        optionIds: exists
          ? state.optionIds.filter((id) => id !== optionId)
          : [...state.optionIds, optionId],
      };
    }),

  reset: () => set({ ...initialDraft }),
}));