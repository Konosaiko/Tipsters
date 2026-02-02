interface StatsCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

/**
 * Card component to display a single stat metric
 */
export const StatsCard = ({ label, value, suffix = '', trend = 'neutral' }: StatsCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-success-500';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-primary-600';
    }
  };

  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4">
      <p className="text-sm font-medium text-neutral-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${getTrendColor()}`}>
        {value}
        {suffix && <span className="text-lg ml-1">{suffix}</span>}
      </p>
    </div>
  );
};
