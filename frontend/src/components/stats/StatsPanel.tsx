import { TipsterStats, PeriodFilter as PeriodFilterType } from '../../types/stats.types';
import { StatsCard } from './StatsCard';
import { PeriodFilter } from './PeriodFilter';

interface StatsPanelProps {
  stats: TipsterStats;
  period: PeriodFilterType;
  onPeriodChange: (period: PeriodFilterType) => void;
  isLoading?: boolean;
}

/**
 * Comprehensive stats display panel
 */
export const StatsPanel = ({
  stats,
  period,
  onPeriodChange,
  isLoading = false,
}: StatsPanelProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const roiTrend = stats.roi > 0 ? 'positive' : stats.roi < 0 ? 'negative' : 'neutral';
  const profitTrend = stats.profit > 0 ? 'positive' : stats.profit < 0 ? 'negative' : 'neutral';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Performance Stats</h3>
        <PeriodFilter value={period} onChange={onPeriodChange} />
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="ROI"
          value={stats.roi.toFixed(2)}
          suffix="%"
          trend={roiTrend}
        />
        <StatsCard
          label="Win Rate"
          value={stats.winRate.toFixed(1)}
          suffix="%"
          trend={stats.winRate >= 50 ? 'positive' : 'neutral'}
        />
        <StatsCard
          label="Profit/Loss"
          value={stats.profit >= 0 ? `+${stats.profit.toFixed(2)}` : stats.profit.toFixed(2)}
          suffix="u"
          trend={profitTrend}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Detailed Breakdown</h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Tips</p>
            <p className="text-lg font-semibold text-gray-900">{stats.totalTips}</p>
          </div>
          <div>
            <p className="text-gray-600">Settled</p>
            <p className="text-lg font-semibold text-gray-900">{stats.settledTips}</p>
          </div>
          <div>
            <p className="text-gray-600">Pending</p>
            <p className="text-lg font-semibold text-gray-900">{stats.pendingTips}</p>
          </div>
          <div>
            <p className="text-gray-600">Avg Odds</p>
            <p className="text-lg font-semibold text-gray-900">{stats.averageOdds.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">{stats.wonTips} won</span>
            {' / '}
            <span className="font-semibold">{stats.lostTips} lost</span>
            {stats.voidTips > 0 && (
              <>
                {' / '}
                <span className="font-semibold">{stats.voidTips} cancelled</span>
              </>
            )}
          </p>
        </div>

        {/* Streaks */}
        {(stats.longestWinStreak > 0 || stats.longestLoseStreak > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {stats.longestWinStreak > 0 && (
                <div>
                  <p className="text-gray-600">Longest Win Streak</p>
                  <p className="text-lg font-semibold text-green-600">
                    {stats.longestWinStreak}
                  </p>
                </div>
              )}
              {stats.longestLoseStreak > 0 && (
                <div>
                  <p className="text-gray-600">Longest Lose Streak</p>
                  <p className="text-lg font-semibold text-red-600">
                    {stats.longestLoseStreak}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
