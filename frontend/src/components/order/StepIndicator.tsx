'use client';

import { useI18n } from '@/i18n/I18nProvider';

export type BuilderStep = 'options' | 'measurements' | 'review';

const STEPS: BuilderStep[] = ['options', 'measurements', 'review'];

const stepKey: Record<BuilderStep, string> = {
  options: 'step_options',
  measurements: 'step_measurements',
  review: 'step_review',
};

export interface StepIndicatorProps {
  current: BuilderStep;
  onSelect: (step: BuilderStep) => void;
}

export function StepIndicator({ current, onSelect }: StepIndicatorProps) {
  const { t } = useI18n();
  const currentIndex = STEPS.indexOf(current);

  return (
    <ol className="flex items-center gap-1 sm:gap-2">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => onSelect(step)}
              aria-current={active ? 'step' : undefined}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-2 py-2 text-xs font-medium transition sm:px-4 sm:text-sm ${
                active
                  ? 'border-forest-800 bg-forest-800 text-white shadow-card'
                  : done
                    ? 'border-forest-200 bg-forest-50 text-forest-800'
                    : 'border-stone-200 bg-white text-ink-soft'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  active
                    ? 'bg-gold-500 text-gold-950'
                    : done
                      ? 'bg-forest-600 text-white'
                      : 'bg-stone-200 text-ink-soft'
                }`}
              >
                {done ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="truncate">{t(stepKey[step])}</span>
            </button>
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={`hidden h-px w-3 sm:block ${index < currentIndex ? 'bg-forest-400' : 'bg-stone-200'}`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}