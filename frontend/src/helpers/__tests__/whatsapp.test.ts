import { describe, expect, it } from 'vitest';
import { buildWaLink, orderMessage } from '../whatsapp';

describe('buildWaLink number conversion', () => {
  it('converts 03XXXXXXXXX to 923XXXXXXXXX', () => {
    expect(buildWaLink('03001234567', 'Hello World')).toBe(
      'https://wa.me/923001234567?text=Hello%20World',
    );
  });

  it('keeps numbers already starting with +92 as 92…', () => {
    expect(buildWaLink('+92 300 1234567', 'Hi')).toBe(
      'https://wa.me/923001234567?text=Hi',
    );
  });

  it('keeps numbers already starting with 92…', () => {
    expect(buildWaLink('923001234567', 'Hi')).toBe(
      'https://wa.me/923001234567?text=Hi',
    );
  });

  it('strips spaces, dashes and parentheses', () => {
    expect(buildWaLink('+92 (300) 123-4567', 'Hello')).toBe(
      'https://wa.me/923001234567?text=Hello',
    );
  });
});

describe('buildWaLink text encoding', () => {
  it('encodes spaces and punctuation', () => {
    const text = 'Order #123 — Ready';
    expect(buildWaLink('03001234567', text)).toBe(
      `https://wa.me/923001234567?text=${encodeURIComponent(text)}`,
    );
  });

  it('encodes Urdu characters', () => {
    const text = 'آرڈر تیار ہے';
    expect(buildWaLink('03001234567', text)).toBe(
      `https://wa.me/923001234567?text=${encodeURIComponent(text)}`,
    );
  });
});

describe('buildWaLink invalid input', () => {
  it('returns a bare wa.me link for empty input', () => {
    expect(buildWaLink('', 'hi')).toBe('https://wa.me/');
  });

  it('returns a bare wa.me link for numbers with no digits', () => {
    expect(buildWaLink('abc-!@#', 'hi')).toBe('https://wa.me/');
  });

  it('returns a bare wa.me link for invalid short numbers', () => {
    expect(buildWaLink('12345', 'hi')).toBe('https://wa.me/');
  });
});

describe('orderMessage', () => {
  it('includes order number, status and total', () => {
    const message = orderMessage(
      { id: 'abc123', status: 'PLACED', totalPrice: 2800 },
      'Lahore Tailors',
    );
    expect(message).toContain('Lahore Tailors');
    expect(message).toContain('Order #abc123');
    expect(message).toContain('Status: PLACED');
    expect(message).toContain('Rs 2,800');
  });

  it('uses a custom status label when provided', () => {
    const message = orderMessage(
      { id: 'xyz', status: 'READY', totalPrice: 1000, finalPrice: 1250 },
      'Shop',
      'تیار',
    );
    expect(message).toContain('Status: تیار');
    expect(message).toContain('Rs 1,250');
  });
});