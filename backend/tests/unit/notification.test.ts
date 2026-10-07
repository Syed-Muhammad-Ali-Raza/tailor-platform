import { env } from '../../src/config/env';
import {
  buildOrderWhatsAppMessage,
  buildWaLink,
  sendOrderNotification,
} from '../../src/proxy/notification.proxy';

describe('notification proxy', () => {
  it('builds a WhatsApp message with order details', () => {
    const message = buildOrderWhatsAppMessage({
      orderNumber: 'TP-ABCD9999',
      status: 'ACCEPTED',
      totalPrice: 6500,
      shopName: 'Rafiq Tailors',
      customerName: 'Sara',
    });

    expect(message).toContain('Rafiq Tailors');
    expect(message).toContain('TP-ABCD9999');
    expect(message).toContain('Sara');
    expect(message).toContain('ACCEPTED');
    expect(message).toContain('Rs 6500.00');
  });

  it('builds wa.me links for local and international numbers', () => {
    expect(buildWaLink('03001234567', 'hello')).toBe(
      'https://wa.me/923001234567?text=hello',
    );
    expect(buildWaLink('+923001234567', 'hi there')).toBe(
      'https://wa.me/923001234567?text=hi%20there',
    );
  });

  it('posts the webhook payload and does not throw on failure', async () => {
    env.NOTIFY_WEBHOOK_URL = 'https://example.test/hook';
    const fetchMock = jest.fn().mockRejectedValue(new Error('network down'));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      sendOrderNotification({
        orderNumber: 'TP-ABCD9999',
        status: 'DELIVERED',
        totalPrice: 6500,
        shopName: 'Rafiq Tailors',
        customerName: 'Sara',
      }),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/hook',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('TP-ABCD9999'),
      }),
    );
    env.NOTIFY_WEBHOOK_URL = '';
  });

  it('skips the webhook when no URL is configured', async () => {
    env.NOTIFY_WEBHOOK_URL = '';
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    await sendOrderNotification({
      orderNumber: 'TP-ABCD9999',
      status: 'PLACED',
      totalPrice: 6500,
      shopName: 'Rafiq Tailors',
      customerName: 'Sara',
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});