'use client';

import { useState } from 'react';
import { apiPost } from '@/helpers/api';
import {
  GARMENT_FIELDS,
  GARMENT_TYPES,
  type GarmentField,
} from '@/helpers/constants';
import { garmentKey } from '@/helpers/format';
import {
  validateMeasurementForm,
  validateMeasurementValue,
} from '@/helpers/validation';
import { useI18n } from '@/i18n/I18nProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MeasurementField } from './MeasurementField';
import type { GarmentType, Measurement } from '@/types';

export interface MeasurementFormProps {
  onSaved?: (measurement: Measurement) => void;
}

export function MeasurementForm({ onSaved }: MeasurementFormProps) {
  const { t } = useI18n();
  const [garmentType, setGarmentType] = useState<GarmentType>('MEN_KURTA');
  const [label, setLabel] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fields = GARMENT_FIELDS[garmentType] ?? [];

  const handleFieldChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    const result = validateMeasurementValue(key, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (result) next[key] = result.error;
      else delete next[key];
      return next;
    });
  };

  const handleGarmentChange = (next: GarmentType) => {
    setGarmentType(next);
    setValues({});
    setErrors({});
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!label.trim()) nextErrors['label'] = 'err_required';

    const fieldErrors = validateMeasurementForm(garmentType, values);
    Object.assign(nextErrors, fieldErrors);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const numericValues: Record<string, number> = {};
      for (const field of fields) {
        numericValues[field.key] = Number(values[field.key]);
      }
      const result = await apiPost<{ measurement: Measurement }>(
        '/measurements',
        { label: label.trim(), garmentType, values: numericValues },
      );
      if (result?.measurement) onSaved?.(result.measurement);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-forest-100 bg-white p-5 shadow-card">
      <Input
        label={t('meas_label')}
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder={t('meas_label_placeholder')}
        error={errors['label'] ? t(errors['label']) : undefined}
      />
      <Select
        label={t('meas_garment_type')}
        value={garmentType}
        onChange={(event) => handleGarmentChange(event.target.value as GarmentType)}
      >
        {GARMENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {t(garmentKey(type))}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field: GarmentField) => (
          <MeasurementField
            key={field.key}
            field={field}
            value={values[field.key] ?? ''}
            error={errors[field.key] ? t(errors[field.key]) : undefined}
            onChange={handleFieldChange}
          />
        ))}
      </div>

      <div>
        <Button onClick={() => void handleSubmit()} loading={submitting}>
          {t('meas_save')}
        </Button>
      </div>
    </div>
  );
}