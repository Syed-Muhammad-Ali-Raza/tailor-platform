export const AUDIENCES = ['MEN', 'WOMEN'] as const;

export const CATEGORIES = [
  'SHALWAR_KAMEEZ',
  'KURTA',
  'WAISTCOAT',
  'KAMEEZ_SHALWAR',
  'SUIT',
  'TROUSER',
  'OTHER',
] as const;

export const GARMENT_TYPES = [
  'MEN_SHALWAR_KAMEEZ',
  'MEN_KURTA',
  'MEN_TROUSER',
  'WOMEN_KAMEEZ',
  'WOMEN_BOTTOM',
] as const;

export const OPTION_TYPES = [
  'COLLAR',
  'CUFF',
  'FRONT',
  'POCKET',
  'TROUSER_STYLE',
  'NECKLINE',
  'SLEEVE',
  'SHAPE',
  'BOTTOM_STYLE',
  'EXTRA',
] as const;

export const ROLES = ['CUSTOMER', 'TAILOR', 'ADMIN'] as const;

export const DELIVERY_TYPES = ['DELIVERY', 'PICKUP'] as const;

export const PAYMENT_METHODS = ['COD', 'PAY_AT_PICKUP'] as const;

export const REQUIRED_MEASUREMENT_FIELDS: Record<string, string[]> = {
  MEN_SHALWAR_KAMEEZ: [
    'length',
    'chest',
    'waist',
    'shoulder',
    'sleeve',
    'neck',
    'daman',
    'shalwarLength',
    'shalwarWaist',
    'bottomWidth',
  ],
  MEN_KURTA: ['length', 'chest', 'waist', 'shoulder', 'sleeve', 'neck', 'daman'],
  MEN_TROUSER: ['length', 'waist', 'bottomWidth'],
  WOMEN_KAMEEZ: [
    'length',
    'bust',
    'waist',
    'hip',
    'shoulder',
    'sleeve',
    'armhole',
    'neckFront',
    'neckBack',
    'daman',
  ],
  WOMEN_BOTTOM: ['waist', 'hip', 'length', 'bottomWidth'],
};
