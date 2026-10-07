import { signToken } from '../../src/middleware/auth.middleware';

export const CUSTOMER = { sub: 'user-customer', role: 'CUSTOMER', name: 'Sara' };
export const TAILOR = { sub: 'user-tailor', role: 'TAILOR', name: 'Rafiq' };

export function tokenFor(user: { sub: string; role: string; name: string }): string {
  return signToken(user);
}

export function bearer(user: { sub: string; role: string; name: string }): {
  Authorization: string;
} {
  return { Authorization: `Bearer ${tokenFor(user)}` };
}

export const tailorRow = {
  id: 'tailor-1',
  userId: TAILOR.sub,
  shopName: 'Rafiq Tailors',
  address: 'Gulberg',
  city: 'Lahore',
  area: 'Gulberg',
  whatsapp: '+923001234567',
  bio: '',
  rating: 4.5,
  servesWomen: true,
  femaleStaff: false,
  portfolioImages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
