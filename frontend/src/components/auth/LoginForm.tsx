'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

function errorKey(code: string | null): string {
  if (code === 'UNAUTHORIZED') return 'err_unauthorized';
  if (code === 'VALIDATION_ERROR') return 'err_validation';
  if (code === 'NETWORK_ERROR') return 'err_network';
  if (code === 'TIMEOUT') return 'err_network';
  if (code === 'RATE_LIMITED') return 'err_rate_limited';
  return 'err_generic';
}

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(false);

  const submitError = error ? t(errorKey(error)) : localError ? t('err_validation') : null;

  const handleSubmit = async () => {
    setLocalError(false);
    if (!identifier.trim() || !password) {
      setLocalError(true);
      return;
    }
    const ok = await login(identifier.trim(), password);
    if (ok) router.push('/');
  };

  return (
    <Card className="relative mx-auto max-w-md overflow-hidden p-8">
      <div
        className="pointer-events-none absolute -top-16 end-0 h-40 w-40 rounded-full bg-gold-100/70 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full border border-gold-300/70 bg-gold-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-800">
          {t('brand_tagline')}
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
          {t('auth_login_title')}
        </h1>
        <div className="mt-6 space-y-4">
          {submitError ? <Alert tone="error">{submitError}</Alert> : null}
          <Input
            label={t('auth_identifier')}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={t('auth_identifier_hint')}
            autoComplete="username"
          />
          <Input
            label={t('auth_password')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          <Button block size="lg" loading={loading} onClick={() => void handleSubmit()}>
            {t('auth_submit_login')}
          </Button>
          <p className="text-sm text-ink-soft">
            {t('auth_no_account')}{' '}
            <Link
              href="/register"
              className="font-medium text-gold-700 hover:text-gold-800 hover:underline"
            >
              {t('auth_submit_register')}
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}