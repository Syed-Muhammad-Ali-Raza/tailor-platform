import type {
  Audience,
  Category,
  GarmentType,
  OptionType,
  OrderStatus,
} from '@/types';

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'PLACED',
  'ACCEPTED',
  'MEASUREMENTS_CONFIRMED',
  'STITCHING',
  'QUALITY_CHECK',
  'READY',
  'DELIVERED',
  'CANCELLED',
];

export const STATUS_FLOW: readonly OrderStatus[] = [
  'PLACED',
  'ACCEPTED',
  'MEASUREMENTS_CONFIRMED',
  'STITCHING',
  'QUALITY_CHECK',
  'READY',
  'DELIVERED',
];

export const AUDIENCES: readonly Audience[] = ['MEN', 'WOMEN'];

export const CATEGORIES: readonly Category[] = [
  'SHALWAR_KAMEEZ',
  'KURTA',
  'WAISTCOAT',
  'KAMEEZ_SHALWAR',
  'SUIT',
  'TROUSER',
  'OTHER',
];

export const GARMENT_TYPES: readonly GarmentType[] = [
  'MEN_SHALWAR_KAMEEZ',
  'MEN_KURTA',
  'MEN_TROUSER',
  'WOMEN_KAMEEZ',
  'WOMEN_BOTTOM',
];

export const MEASUREMENT_MIN = 1;
export const MEASUREMENT_MAX = 72;

export interface GarmentField {
  key: string;
  labelKey: string;
  min: number;
  max: number;
}

const field = (key: string): GarmentField => ({
  key,
  labelKey: `f_${key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)}`,
  min: MEASUREMENT_MIN,
  max: MEASUREMENT_MAX,
});

export const GARMENT_FIELDS: Record<GarmentType, GarmentField[]> = {
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
  ].map(field),
  MEN_KURTA: [
    'length',
    'chest',
    'waist',
    'shoulder',
    'sleeve',
    'neck',
    'daman',
  ].map(field),
  MEN_TROUSER: ['length', 'waist', 'bottomWidth'].map(field),
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
  ].map(field),
  WOMEN_BOTTOM: ['waist', 'hip', 'length', 'bottomWidth'].map(field),
};

export interface OptionGroup {
  type: OptionType;
  labelKey: string;
}

export const OPTION_GROUPS: Record<Audience, OptionGroup[]> = {
  MEN: [
    { type: 'COLLAR', labelKey: 'opt_collar' },
    { type: 'CUFF', labelKey: 'opt_cuff' },
    { type: 'FRONT', labelKey: 'opt_front' },
    { type: 'POCKET', labelKey: 'opt_pocket' },
    { type: 'TROUSER_STYLE', labelKey: 'opt_trouser_style' },
    { type: 'EXTRA', labelKey: 'opt_extra' },
  ],
  WOMEN: [
    { type: 'NECKLINE', labelKey: 'opt_neckline' },
    { type: 'SLEEVE', labelKey: 'opt_sleeve' },
    { type: 'SHAPE', labelKey: 'opt_shape' },
    { type: 'BOTTOM_STYLE', labelKey: 'opt_bottom_style' },
    { type: 'EXTRA', labelKey: 'opt_extra' },
  ],
};

export const FALLBACK_IMAGES: Record<string, string> = {
  KURTA: '/images/kurta.svg',
  WAISTCOAT: '/images/waistcoat.svg',
  SUIT: '/images/suit.svg',
  SHALWAR_KAMEEZ: '/images/kameez.svg',
  KAMEEZ_SHALWAR: '/images/kameez.svg',
};

export const DEFAULT_PLACEHOLDER = '/images/kurta.svg';
