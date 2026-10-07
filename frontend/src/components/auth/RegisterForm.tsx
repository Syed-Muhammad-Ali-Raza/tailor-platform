'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isValidPhone } from '@/helpers/validation';
import { useAuth } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

function errorKey(code: string | null): string {
  if (code === 'CONFLICT') return 'err_conflict';
  if (code === 'VALIDATION_ERROR') return 'err_validation';
  if (code === 'NETWORK_ERROR') return 'err_network';
  if (code === 'TIMEOUT') return 'err_network';
  if (code === 'RATE_LIMITED') return 'err_rate_limited';
  return 'err_generic';
}

export function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'TAILOR'>('CUSTOMER');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submitError = error ? t(errorKey(error)) : null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t('err_name_required');
    if (!isValidPhone(phone)) next.phone = t('err_phone_invalid');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = t('err_email_invalid');
    }
    if (password.length < 8) next.password = t('err_password_short');
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const ok = await register({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      password,
      role,
    });
    if (ok) router.push('/');
  };

  return (
    <Card className="relative mx-auto max-w-md overflow-hidden p-8">
      <div
        className="pointer-events-none absolute -top-16 end-0 h-40 w-40 rounded-full bg-forest-100/70 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-800">
          {t('brand_tagline')}
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
          {t('auth_register_title')}
        </h1>
        <div className="mt-6 space-y-4">
          {submitError ? <Alert tone="error">{submitError}</Alert> : null}
          <Input
            label={t('auth_name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={fieldErrors.name}
            autoComplete="name"
          />
          <Input
            label={t('auth_phone')}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t('auth_identifier_hint')}
            error={fieldErrors.phone}
            autoComplete="tel"
          />
          <Input
            label={t('auth_email')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
          />
          <Input
            label={t('auth_password')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            autoComplete="new-password"
          />
          <fieldset>
            <legend className="mb-1 block text-sm font-medium text-ink">
              {t('auth_role')}
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(['CUSTOMER', 'TAILOR'] as const).map((value) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    role === value
                      ? 'border-forest-500 bg-forest-50 text-ink shadow-card'
                      : 'border-stone-300 bg-white text-ink-soft'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={role === value}
                    onChange={() => setRole(value)}
                    className="h-4 w-4 accent-forest-700"
                  />
                  {value === 'CUSTOMER' ? t('auth_role_customer') : t('auth_role_tailor')}
                </label>
              ))}
            </div>
          </fieldset>
          <Button block size="lg" loading={loading} onClick={() => void handleSubmit()}>
            {t('auth_submit_register')}
          </Button>
          <p className="text-sm text-ink-soft">
            {t('auth_have_account')}{' '}
            <Link
              href="/login"
              className="font-medium text-gold-700 hover:text-gold-800 hover:underline"
            >
              {t('auth_submit_login')}
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}