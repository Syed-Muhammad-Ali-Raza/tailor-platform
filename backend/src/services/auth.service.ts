import bcrypt from 'bcryptjs';
import { AppError, unauthorized } from '../utils/errors';
import { signToken } from '../middleware/auth.middleware';
import * as userModel from '../models/user.model';
import * as tailorModel from '../models/tailor.model';
import { PrismaLike } from '../types/deps';

export interface RegisterInput {
  name: string;
  phone: string;
  password: string;
  email?: string;
  role?: 'CUSTOMER' | 'TAILOR';
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export async function register(prisma: PrismaLike, input: RegisterInput) {
  const existingPhone = await userModel.findUserByPhone(prisma, input.phone);
  if (existingPhone) throw new AppError('CONFLICT', 'Phone number is already registered');

  if (input.email) {
    const existingEmail = await userModel.findUserByEmail(prisma, input.email);
    if (existingEmail) throw new AppError('CONFLICT', 'Email is already registered');
  }

  const role = input.role ?? 'CUSTOMER';
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await userModel.createUser(prisma, {
    name: input.name,
    phone: input.phone,
    email: input.email,
    passwordHash,
    role,
  });

  if (role === 'TAILOR') {
    await tailorModel.createTailor(prisma, {
      userId: user.id,
      shopName: `${input.name}'s Tailors`,
      address: '',
      city: 'Lahore',
      area: '',
      whatsapp: input.phone,
      bio: '',
    });
  }

  const token = signToken({ sub: user.id, role: user.role, name: user.name });
  return { token, user: userModel.publicUser(user) };
}

export async function login(prisma: PrismaLike, input: LoginInput) {
  const user = await userModel.findUserByIdentifier(prisma, input.identifier);
  if (!user) throw unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw unauthorized('Invalid credentials');

  const token = signToken({ sub: user.id, role: user.role, name: user.name });
  return { token, user: userModel.publicUser(user) };
}

export async function me(prisma: PrismaLike, userId: string) {
  const user = await userModel.findUserById(prisma, userId);
  if (!user) throw unauthorized();
  return { user: userModel.publicUser(user) };
}

export async function requireTailorRow(prisma: PrismaLike, userId: string) {
  const tailor = await tailorModel.findTailorByUserId(prisma, userId);
  if (!tailor) throw new AppError('NOT_FOUND', 'Tailor profile not found for this account');
  return tailor;
}
