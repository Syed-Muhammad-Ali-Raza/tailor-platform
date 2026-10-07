'use client';

import { useState } from 'react';
import { AUDIENCES, CATEGORIES } from '@/helpers/constants';
import { audienceKey, categoryKey } from '@/helpers/format';
import { useI18n } from '@/i18n/I18nProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Audience, Category, DesignDetail } from '@/types';

export interface DesignFormPayload {
  name: string;
  audience: Audience;
  category: Category;
  basePrice: number;
  images: string[];
  active: boolean;
}

export interface DesignFormProps {
  initial?: DesignDetail;
  onSubmit: (payload: DesignFormPayload) => void | Promise<void>;
  onCancel: () => void;
}

export function DesignForm({ initial, onSubmit, onCancel }: DesignFormProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initial?.name ?? '');
  const [audience, setAudience] = useState<Audience>(initial?.audience ?? 'MEN');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'KURTA');
  const [basePrice, setBasePrice] = useState(
    initial ? String(initial.basePrice) : '',
  );
  const [images, setImages] = useState((initial?.images ?? []).join(', '));
  const [active, setActive] = useState(initial?.active ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !basePrice.trim()) return;
    const price = Number(basePrice);
    if (!Number.isFinite(price) || price < 0) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        audience,
        category,
        basePrice: price,
        images: images
          .split(',')
          .map((url) => url.trim())
          .filter(Boolean),
        active,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-forest-100 bg-white p-5 shadow-card">
      <Input
        label={t('dash_field_name')}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t('dash_field_audience')}
          value={audience}
          onChange={(event) => setAudience(event.target.value as Audience)}
        >
          {AUDIENCES.map((value) => (
            <option key={value} value={value}>
              {t(audienceKey(value))}
            </option>
          ))}
        </Select>
        <Select
          label={t('dash_field_category')}
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
        >
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {t(categoryKey(value))}
            </option>
          ))}
        </Select>
      </div>
      <Input
        label={t('dash_field_price')}
        type="number"
        min={0}
        step="0.01"
        value={basePrice}
        onChange={(event) => setBasePrice(event.target.value)}
      />
      <Input
        label={t('dash_field_images')}
        value={images}
        onChange={(event) => setImages(event.target.value)}
        hint={t('dash_images_hint')}
      />
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="h-4 w-4 accent-forest-700"
        />
        {t('dash_field_active')}
      </label>
      <div className="flex gap-2">
        <Button loading={submitting} onClick={() => void handleSubmit()}>
          {t('dash_save')}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t('common_cancel')}
        </Button>
      </div>
    </div>
  );
}