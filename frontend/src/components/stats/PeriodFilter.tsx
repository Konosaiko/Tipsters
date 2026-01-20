import { PeriodFilter as PeriodFilterType, PERIOD_LABELS } from '../../types/stats.types';

interface PeriodFilterProps {
  value: PeriodFilterType;
  onChange: (period: PeriodFilterType) => void;
}

/**
 * Dropdown selector for stats period filter
 */
export const PeriodFilter = ({ value, onChange }: PeriodFilterProps) => {
  const periods: PeriodFilterType[] = ['all', '7d', '30d', '90d', 'year'];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PeriodFilterType)}
      className="block px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
    >
      {periods.map((period) => (
        <option key={period} value={period}>
          {PERIOD_LABELS[period]}
        </option>
      ))}
    </select>
  );
};
