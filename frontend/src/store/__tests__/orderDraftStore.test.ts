import { beforeEach, describe, expect, it } from 'vitest';
import { useOrderDraftStore } from '../orderDraftStore';

describe('orderDraftStore', () => {
  beforeEach(() => {
    useOrderDraftStore.getState().reset();
  });

  it('starts with sensible defaults', () => {
    const state = useOrderDraftStore.getState();
    expect(state.designId).toBeNull();
    expect(state.fabricId).toBeNull();
    expect(state.optionIds).toEqual([]);
    expect(state.measurementId).toBeNull();
    expect(state.quantity).toBe(1);
    expect(state.deliveryType).toBe('DELIVERY');
    expect(state.paymentMethod).toBe('COD');
    expect(state.notes).toBe('');
    expect(state.referencePhotoUrl).toBeNull();
  });

  it('updates a single field', () => {
    useOrderDraftStore.getState().setField('quantity', 3);
    useOrderDraftStore.getState().setField('notes', 'Please wash before stitching');

    const state = useOrderDraftStore.getState();
    expect(state.quantity).toBe(3);
    expect(state.notes).toBe('Please wash before stitching');
  });

  it('toggles option ids on and off', () => {
    const store = useOrderDraftStore;

    store.getState().toggleOption('opt-cuff-1');
    expect(store.getState().optionIds).toEqual(['opt-cuff-1']);

    store.getState().toggleOption('opt-cuff-2');
    expect(store.getState().optionIds).toEqual(['opt-cuff-1', 'opt-cuff-2']);

    store.getState().toggleOption('opt-cuff-1');
    expect(store.getState().optionIds).toEqual(['opt-cuff-2']);
  });

  it('reset restores the default draft', () => {
    const store = useOrderDraftStore;
    store.getState().setField('designId', 'd1');
    store.getState().setField('fabricId', 'f9');
    store.getState().setField('quantity', 5);
    store.getState().toggleOption('o1');

    store.getState().reset();

    const state = store.getState();
    expect(state.designId).toBeNull();
    expect(state.fabricId).toBeNull();
    expect(state.quantity).toBe(1);
    expect(state.optionIds).toEqual([]);
  });
});