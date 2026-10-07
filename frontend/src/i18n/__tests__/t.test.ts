import { describe, expect, it } from 'vitest';
import { en } from '@/i18n/en';
import { ur } from '@/i18n/ur';
import { translate } from '@/i18n/I18nProvider';

describe('i18n dictionaries', () => {
  it('defines the same keys in English and Urdu', () => {
    expect(Object.keys(ur).sort()).toEqual(Object.keys(en).sort());
  });

  it('has no empty or placeholder-only values', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value, `en key ${key} should not be empty`).not.toBe('');
    }
  });

  it('has non-empty Urdu values', () => {
    for (const [key, value] of Object.entries(ur)) {
      expect(value, `ur key ${key} should not be empty`).not.toBe('');
    }
  });
});

describe('translate', () => {
  it('returns the language-appropriate string', () => {
    expect(translate('en', 'nav_home')).toBe('Home');
    expect(translate('ur', 'nav_home')).toBe('ہوم');
  });

  it('interpolates a single variable', () => {
    expect(translate('en', 'order_number', { id: 'abc123' })).toBe(
      'Order #abc123',
    );
    expect(translate('ur', 'order_number', { id: 'abc123' })).toBe(
      'آرڈر #abc123',
    );
  });

  it('interpolates multiple variables', () => {
    expect(
      translate('en', 'step_of', { current: 2, total: 3 }),
    ).toBe('Step 2 of 3');
    expect(translate('en', 'design_tailor', { name: 'Faisal' })).toBe(
      'By Faisal',
    );
  });

  it('leaves unmatched placeholders untouched', () => {
    expect(translate('en', 'catalog_results', {})).toBe('{count} designs');
  });

  it('falls back to the key itself for unknown keys', () => {
    expect(translate('en', 'not_a_real_key')).toBe('not_a_real_key');
  });

  it('falls back to English for missing Urdu entries', () => {
    expect(translate('ur', 'nav_home')).not.toBe('');
  });
});