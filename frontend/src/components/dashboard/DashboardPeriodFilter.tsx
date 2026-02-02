import { PeriodFilter } from '../../types/stats.types';

interface DashboardPeriodFilterProps {
  value: PeriodFilter;
  onChange: (period: PeriodFilter) => void;
}

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'year', label: 'This Year' },
];

export const DashboardPeriodFilter = ({ value, onChange }: DashboardPeriodFilterProps) => {
  return (
    <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
      {periodOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            value === option.value
              ? 'bg-primary-500 text-neutral-950'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
