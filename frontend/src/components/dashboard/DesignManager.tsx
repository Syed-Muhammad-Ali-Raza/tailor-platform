'use client';

import { useState } from 'react';
import { apiDelete, apiPost, apiPut } from '@/helpers/api';
import { useTailorDesigns } from '@/hooks';
import { formatPkr, categoryKey } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { DesignForm, type DesignFormPayload } from './DesignForm';
import type { DesignDetail } from '@/types';

export function DesignManager() {
  const { t } = useI18n();
  const { data: designs, loading, error, run } = useTailorDesigns();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState(false);

  const handleCreate = async (payload: DesignFormPayload) => {
    setActionError(false);
    try {
      await apiPost('/tailor/designs', payload);
      setCreating(false);
      void run();
    } catch {
      setActionError(true);
    }
  };

  const handleUpdate = async (id: string, payload: DesignFormPayload) => {
    setActionError(false);
    try {
      await apiPut(`/tailor/designs/${id}`, payload);
      setEditingId(null);
      void run();
    } catch {
      setActionError(true);
    }
  };

  const handleToggleActive = async (design: DesignDetail) => {
    setActionError(false);
    try {
      await apiPut(`/tailor/designs/${design.id}`, {
        active: !design.active,
      });
      void run();
    } catch {
      setActionError(true);
    }
  };

  const handleDelete = async (id: string) => {
    setActionError(false);
    try {
      await apiDelete(`/tailor/designs/${id}`);
      setDeletingId(null);
      void run();
    } catch {
      setActionError(true);
    }
  };

  if (loading && !designs) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-ink-soft">{t('common_loading')}</span>
      </div>
    );
  }

  if (error) {
    return <Alert tone="error">{t('err_generic')}</Alert>;
  }

  const editingDesign = designs?.find((design) => design.id === editingId) ?? null;

  return (
    <div className="space-y-4">
      {actionError ? <Alert tone="error">{t('err_generic')}</Alert> : null}

      <div className="flex justify-end">
        <Button disabled={creating} onClick={() => setCreating(true)}>
          {t('dash_designs_new')}
        </Button>
      </div>

      {creating ? (
        <DesignForm
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
        />
      ) : null}

      {editingDesign ? (
        <DesignForm
          initial={editingDesign}
          onSubmit={(payload) => handleUpdate(editingDesign.id, payload)}
          onCancel={() => setEditingId(null)}
        />
      ) : null}

      {!designs || designs.length === 0 ? (
        <EmptyState title={t('dash_designs_empty')} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200/80 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-stone-200/80 text-xs uppercase tracking-[0.14em] text-gold-700">
                <th className="px-4 py-3 text-start font-semibold">{t('dash_field_name')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('dash_field_category')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('dash_field_price')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('dash_field_active')}</th>
                <th className="px-4 py-3 text-end font-semibold">{t('dash_tab_designs')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {designs.map((design) => (
                <tr key={design.id} className="transition hover:bg-forest-50/60">
                  <td className="px-4 py-3 font-medium text-ink">{design.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{t(categoryKey(design.category))}</td>
                  <td className="px-4 py-3 font-semibold text-forest-800">
                    {formatPkr(design.basePrice)}
                  </td>
                  <td className="px-4 py-3">
                    {deletingId === design.id ? (
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          className="min-h-9 px-2 text-xs"
                          onClick={() => void handleDelete(design.id)}
                        >
                          {t('common_confirm')}
                        </Button>
                        <Button
                          variant="ghost"
                          className="min-h-9 px-2 text-xs"
                          onClick={() => setDeletingId(null)}
                        >
                          {t('common_cancel')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge tone={design.active ? 'success' : 'danger'}>
                          {design.active
                            ? t('dash_field_active')
                            : t('dash_inactive')}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(design)}
                          className="text-xs font-medium text-emerald-700 underline-offset-2 hover:underline"
                        >
                          {design.active ? t('dash_inactive') : t('dash_field_active')}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        className="min-h-9 px-2 text-xs"
                        onClick={() => setEditingId(design.id)}
                      >
                        {t('dash_designs_edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        className="min-h-9 px-2 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => setDeletingId(design.id)}
                      >
                        {t('dash_designs_delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}