'use client';

import { useState } from 'react';
import { apiPost } from '@/helpers/api';
import { useAuth } from '@/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface PreviewResult {
  preview: { id: string; imageUrl: string; createdAt: string; label: string };
}

type PreviewState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; imageUrl: string }
  | { kind: 'error'; code: string; message: string };

export function StylePreviewPanel({ designId, designName }: { designId: string; designName: string }) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<PreviewState>({ kind: 'idle' });
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setState({ kind: 'loading' });
    try {
      const result = await apiPost<PreviewResult>('/tryon/preview', { designId });
      if (result?.preview?.imageUrl) {
        setState({ kind: 'done', imageUrl: result.preview.imageUrl });
      } else {
        setState({ kind: 'error', code: 'UNKNOWN', message: t('style_preview_oops') });
      }
    } catch (error) {
      const apiError = error as { code?: string; message?: string };
      setState({
        kind: 'error',
        code: apiError.code ?? 'UNKNOWN',
        message: apiError.message ?? t('style_preview_oops'),
      });
    }
  };

  return (
    <div className="border-t border-stone-200/70 pt-4">
      <Button
        variant={open ? 'secondary' : 'ghost'}
        block
        onClick={() => {
          setOpen((value) => !value);
          if (state.kind === 'idle') void generate();
        }}
        disabled={!isAuthenticated}
      >
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7M15 15h6v6h-6z"
            />
          </svg>
          {open ? t('style_preview_close') : t('style_preview_action')}
        </span>
      </Button>

      {!isAuthenticated ? (
        <p className="mt-2 text-center text-xs text-ink-soft">{t('auth_signin_required')}</p>
      ) : null}

      {open ? (
        <div className="mt-4">
          {state.kind === 'loading' ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-gold-300/60 bg-gold-50 p-6">
              <Spinner size="lg" />
              <p className="text-sm text-ink">{t('style_preview_loading')}</p>
            </div>
          ) : null}

          {state.kind === 'done' ? (
            <div className="overflow-hidden rounded-2xl border border-forest-200 bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-forest-100 bg-forest-50 px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-800">
                  {t('style_preview_title')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-700">
                  {designName}
                </span>
              </div>
              <img
                src={state.imageUrl}
                alt={t('style_preview_title')}
                className="w-full bg-canvas"
              />
              <p className="px-4 py-2.5 text-xs text-ink-soft">{t('style_preview_disclaimer')}</p>
            </div>
          ) : null}

          {state.kind === 'error' ? (
            <Alert tone={state.code === 'FEATURE_DISABLED' ? 'info' : 'error'}>
              {state.code === 'FEATURE_DISABLED'
                ? t('style_preview_disabled')
                : state.code === 'RATE_LIMITED'
                  ? t('err_rate_limited')
                  : t('style_preview_oops')}
            </Alert>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}