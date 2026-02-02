interface DashboardStatCardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: 'chart' | 'target' | 'money' | 'bets';
}

const Icons = {
  chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  target: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  money: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  bets: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
};

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') {
    return (
      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  if (trend === 'down') {
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }
  return null;
};

export const DashboardStatCard = ({ label, value, trend, icon }: DashboardStatCardProps) => {
  const IconComponent = icon ? Icons[icon] : null;

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 hover:border-neutral-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <span className="text-neutral-400 text-sm font-medium">{label}</span>
        {IconComponent && (
          <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center text-primary-500">
            <IconComponent />
          </div>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${
          trend === 'up' ? 'text-primary-500' :
          trend === 'down' ? 'text-red-500' :
          'text-white'
        }`}>
          {value}
        </span>
        {trend && <TrendIcon trend={trend} />}
      </div>
    </div>
  );
};
