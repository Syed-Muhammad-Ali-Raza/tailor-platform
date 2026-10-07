'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { Textarea } from '@/components/ui/Textarea';

export interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesInput({ value, onChange }: NotesInputProps) {
  const { t } = useI18n();

  return (
    <Textarea
      label={t('notes_label')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={t('notes_placeholder')}
      rows={3}
    />
  );
}