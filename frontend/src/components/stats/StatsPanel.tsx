import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-neutral-400">{t('stats.loadingStats')}</p>
        </div>
      </div>
    );
  }

  const roiTrend = (stats.roi ?? 0) > 0 ? 'positive' : (stats.roi ?? 0) < 0 ? 'negative' : 'neutral';
  const profitTrend = (stats.profit ?? 0) > 0 ? 'positive' : (stats.profit ?? 0) < 0 ? 'negative' : 'neutral';

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">{t('stats.performanceStats')}</h3>
        <PeriodFilter value={period} onChange={onPeriodChange} />
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          label={t('stats.roi')}
          value={(stats.roi ?? 0).toFixed(2)}
          suffix="%"
          trend={roiTrend}
        />
        <StatsCard
          label={t('stats.winRate')}
          value={(stats.winRate ?? 0).toFixed(1)}
          suffix="%"
          trend={(stats.winRate ?? 0) >= 50 ? 'positive' : 'neutral'}
        />
        <StatsCard
          label={t('stats.profitLoss')}
          value={(stats.profit ?? 0) >= 0 ? `+${(stats.profit ?? 0).toFixed(2)}` : (stats.profit ?? 0).toFixed(2)}
          suffix="u"
          trend={profitTrend}
        />
      </div>

      {/* Detailed Breakdown */}
      <div className="border-t border-neutral-800 pt-4">
        <h4 className="text-sm font-semibold text-neutral-300 mb-3">{t('stats.detailedBreakdown')}</h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-neutral-400">{t('stats.totalTips')}</p>
            <p className="text-lg font-semibold text-white">{stats.totalTips}</p>
          </div>
          <div>
            <p className="text-neutral-400">{t('stats.settled')}</p>
            <p className="text-lg font-semibold text-white">{stats.settledTips}</p>
          </div>
          <div>
            <p className="text-neutral-400">{t('stats.pending')}</p>
            <p className="text-lg font-semibold text-white">{stats.pendingTips}</p>
          </div>
          <div>
            <p className="text-neutral-400">{t('stats.avgOdds')}</p>
            <p className="text-lg font-semibold text-white">{(stats.averageOdds ?? 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800">
          <p className="text-sm text-neutral-300 mb-2">
            <span className="font-semibold">{stats.wonTips} {t('overview.won').toLowerCase()}</span>
            {' / '}
            <span className="font-semibold">{stats.lostTips} {t('overview.lost').toLowerCase()}</span>
            {stats.voidTips > 0 && (
              <>
                {' / '}
                <span className="font-semibold">{stats.voidTips} {t('stats.cancelled')}</span>
              </>
            )}
          </p>
        </div>

        {/* Streaks */}
        {(stats.longestWinStreak > 0 || stats.longestLoseStreak > 0) && (
          <div className="mt-4 pt-4 border-t border-neutral-800">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {stats.longestWinStreak > 0 && (
                <div>
                  <p className="text-neutral-400">{t('stats.longestWinStreak')}</p>
                  <p className="text-lg font-semibold text-success-500">
                    {stats.longestWinStreak}
                  </p>
                </div>
              )}
              {stats.longestLoseStreak > 0 && (
                <div>
                  <p className="text-neutral-400">{t('stats.longestLoseStreak')}</p>
                  <p className="text-lg font-semibold text-red-500">
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
