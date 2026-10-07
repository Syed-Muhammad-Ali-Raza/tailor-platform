'use client';

import { OPTION_GROUPS } from '@/helpers/constants';
import { useI18n } from '@/i18n/I18nProvider';
import { FabricPicker } from '@/components/customize/FabricPicker';
import { NotesInput } from '@/components/customize/NotesInput';
import { OptionGroup } from '@/components/customize/OptionGroup';
import { QuantityStepper } from '@/components/customize/QuantityStepper';
import type { DesignDetail } from '@/types';

export interface OptionsStepProps {
  design: DesignDetail;
  fabricId: string | null;
  optionIds: string[];
  quantity: number;
  notes: string;
  onFabricSelect: (id: string | null) => void;
  onToggleOption: (optionId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onNotesChange: (notes: string) => void;
}

export function OptionsStep({
  design,
  fabricId,
  optionIds,
  quantity,
  notes,
  onFabricSelect,
  onToggleOption,
  onQuantityChange,
  onNotesChange,
}: OptionsStepProps) {
  const { t } = useI18n();
  const groups = OPTION_GROUPS[design.audience] ?? [];

  return (
    <div className="space-y-5">
      <section aria-label={t('design_fabrics')}>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
          {t('design_fabrics')}
        </h2>
        <FabricPicker
          fabrics={design.fabrics}
          selectedId={fabricId}
          onSelect={onFabricSelect}
        />
      </section>

      {groups.map((group) => {
        const options = design.styleOptions.filter((option) => option.type === group.type);
        return (
          <OptionGroup
            key={group.type}
            labelKey={group.labelKey}
            options={options}
            selectedIds={optionIds}
            onToggle={onToggleOption}
          />
        );
      })}

      <QuantityStepper value={quantity} onChange={onQuantityChange} />
      <NotesInput value={notes} onChange={onNotesChange} />
    </div>
  );
}