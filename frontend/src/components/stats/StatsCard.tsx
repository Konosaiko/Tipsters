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
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-indigo-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${getTrendColor()}`}>
        {value}
        {suffix && <span className="text-lg ml-1">{suffix}</span>}
      </p>
    </div>
  );
};
