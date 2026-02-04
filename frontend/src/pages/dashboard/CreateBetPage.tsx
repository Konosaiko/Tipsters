import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tipsterApi } from '../../api/tipster.api';
import { tipApi } from '../../api/tip.api';
import { CreateTipDto, Sport, TipVisibility } from '../../types/tip.types';
import { Tipster } from '../../types/tipster.types';

export const CreateBetPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tipsterProfile, setTipsterProfile] = useState<Tipster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<CreateTipDto>({
    event: '',
    prediction: '',
    odds: 0,
    explanation: '',
    stake: 1,
    sport: undefined,
    platform: undefined,
    betLink: undefined,
    visibility: TipVisibility.FREE,
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await tipsterApi.getMyTipsterProfile();
        setTipsterProfile(profile);
      } catch {
        setTipsterProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await tipApi.createTip(formData);
      navigate('/dashboard/bets');
    } catch (err: any) {
      setError(err.response?.data?.error || t('createBet.failedToCreate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">{t('common.loading')}</div>
      </div>
    );
  }

  if (!tipsterProfile) {
    return (
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8 text-center">
        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-2">{t('createBet.tipsterRequired')}</h3>
        <p className="text-neutral-500 mb-6">
          {t('createBet.needTipsterProfile')}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors"
        >
          {t('createBet.goToDashboard')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('createBet.createNewBet')}</h1>
        <p className="text-neutral-400 mt-1">
          {t('createBet.sharePrediction')}
        </p>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Event */}
          <div>
            <label htmlFor="event" className="block text-sm font-medium text-neutral-300 mb-2">
              {t('createBet.event')} *
            </label>
            <input
              type="text"
              id="event"
              required
              placeholder={t('createBet.eventPlaceholder')}
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Prediction */}
          <div>
            <label htmlFor="prediction" className="block text-sm font-medium text-neutral-300 mb-2">
              {t('createBet.prediction')} *
            </label>
            <input
              type="text"
              id="prediction"
              required
              placeholder={t('createBet.predictionPlaceholder')}
              value={formData.prediction}
              onChange={(e) => setFormData({ ...formData, prediction: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Odds & Stake */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="odds" className="block text-sm font-medium text-neutral-300 mb-2">
                {t('createBet.odds')} *
              </label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                id="odds"
                required
                placeholder={t('createBet.oddsPlaceholder')}
                value={formData.odds || ''}
                onChange={(e) => setFormData({ ...formData, odds: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="stake" className="block text-sm font-medium text-neutral-300 mb-2">
                {t('createBet.stake')} *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                id="stake"
                required
                placeholder={t('createBet.stakePlaceholder')}
                value={formData.stake || 1}
                onChange={(e) => setFormData({ ...formData, stake: parseFloat(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Sport & Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-neutral-300 mb-2">
                {t('createBet.sport')}
              </label>
              <select
                id="sport"
                value={formData.sport || ''}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value ? (e.target.value as Sport) : undefined })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('createBet.selectSport')}</option>
                <option value={Sport.FOOTBALL}>{t('sports.football')}</option>
                <option value={Sport.BASKETBALL}>{t('sports.basketball')}</option>
                <option value={Sport.TENNIS}>{t('sports.tennis')}</option>
                <option value={Sport.RUGBY}>{t('sports.rugby')}</option>
                <option value={Sport.MMA}>{t('sports.mma')}</option>
                <option value={Sport.BOXING}>{t('sports.boxing')}</option>
                <option value={Sport.ESPORTS}>{t('sports.esports')}</option>
                <option value={Sport.HOCKEY}>{t('sports.hockey')}</option>
                <option value={Sport.VOLLEYBALL}>{t('sports.volleyball')}</option>
                <option value={Sport.BASEBALL}>{t('sports.baseball')}</option>
                <option value={Sport.AMERICAN_FOOTBALL}>{t('sports.americanFootball')}</option>
                <option value={Sport.OTHER}>{t('sports.other')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-neutral-300 mb-2">
                {t('createBet.platform')}
              </label>
              <select
                id="platform"
                value={formData.platform || ''}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value || undefined })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('createBet.selectPlatform')}</option>
                <option value="Betclic">{t('platforms.betclic')}</option>
                <option value="Winamax">{t('platforms.winamax')}</option>
                <option value="Unibet">{t('platforms.unibet')}</option>
                <option value="ParionsSport">{t('platforms.parionsSport')}</option>
                <option value="PMU">{t('platforms.pmu')}</option>
                <option value="Bet365">{t('platforms.bet365')}</option>
                <option value="Other">{t('platforms.other')}</option>
              </select>
            </div>
          </div>

          {/* Bet Link */}
          <div>
            <label htmlFor="betLink" className="block text-sm font-medium text-neutral-300 mb-2">
              {t('createBet.betLink')}
            </label>
            <input
              type="url"
              id="betLink"
              placeholder={t('createBet.betLinkPlaceholder')}
              value={formData.betLink || ''}
              onChange={(e) => setFormData({ ...formData, betLink: e.target.value || undefined })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {t('createBet.betLinkHelper')}
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">
              {t('createBet.visibility')}
            </label>
            <div className="flex gap-4">
              <label className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${
                formData.visibility === TipVisibility.FREE
                  ? 'bg-primary-500/10 border-primary-500'
                  : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
              }`}>
                <input
                  type="radio"
                  name="visibility"
                  value={TipVisibility.FREE}
                  checked={formData.visibility === TipVisibility.FREE}
                  onChange={() => setFormData({ ...formData, visibility: TipVisibility.FREE })}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.visibility === TipVisibility.FREE
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-neutral-500'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{t('createBet.free')}</p>
                    <p className="text-xs text-neutral-500">{t('createBet.freeHelper')}</p>
                  </div>
                </div>
              </label>

              <label className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${
                formData.visibility === TipVisibility.PREMIUM
                  ? 'bg-primary-500/10 border-primary-500'
                  : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
              }`}>
                <input
                  type="radio"
                  name="visibility"
                  value={TipVisibility.PREMIUM}
                  checked={formData.visibility === TipVisibility.PREMIUM}
                  onChange={() => setFormData({ ...formData, visibility: TipVisibility.PREMIUM })}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.visibility === TipVisibility.PREMIUM
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-neutral-500'
                  }`} />
                  <div>
                    <p className="font-medium text-white">{t('createBet.premium')}</p>
                    <p className="text-xs text-neutral-500">{t('createBet.premiumHelper')}</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-neutral-300 mb-2">
              {t('createBet.explanation')}
            </label>
            <textarea
              id="explanation"
              rows={4}
              placeholder={t('createBet.explanationPlaceholder')}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Preview */}
          {formData.event && formData.odds > 0 && (
            <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
              <p className="text-sm text-neutral-500 mb-2">{t('createBet.preview')}</p>
              <p className="text-white font-medium">{formData.event}</p>
              <p className="text-primary-400">{formData.prediction}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-neutral-400">{t('createBet.oddsLabel')} <span className="text-white">{formData.odds}</span></span>
                <span className="text-neutral-400">{t('createBet.stakeLabel')} <span className="text-white">{formData.stake}u</span></span>
                <span className="text-neutral-400">{t('createBet.potentialLabel')} <span className="text-primary-500">+{((formData.odds - 1) * (formData.stake || 1)).toFixed(2)}u</span></span>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary-500 text-neutral-950 rounded-lg font-semibold hover:bg-primary-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t('createBet.publishing') : t('createBet.publishBet')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/bets')}
              className="px-6 py-3 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
