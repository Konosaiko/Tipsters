import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { tipsterApi } from '../../api/tipster.api';
import { Tipster } from '../../types/tipster.types';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tipsterProfile, setTipsterProfile] = useState<Tipster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await tipsterApi.getMyTipsterProfile();
        setTipsterProfile(profile);
        setDisplayName(profile.displayName);
        setBio(profile.bio || '');
      } catch {
        setTipsterProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: t('settings.displayNameRequired') });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (!tipsterProfile) {
        setMessage({ type: 'error', text: t('settings.noTipsterProfile') });
        return;
      }
      await tipsterApi.updateTipster(tipsterProfile.id, { displayName, bio });
      setTipsterProfile((prev) => prev ? { ...prev, displayName, bio } : prev);
      setIsEditing(false);
      setMessage({ type: 'success', text: t('settings.profileUpdated') });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || t('settings.failedToUpdate') });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
        <p className="text-neutral-400 mt-1">
          {t('settings.manageAccount')}
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-primary-500/10 border-primary-500/20 text-primary-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Account Info */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t('settings.accountInfo')}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">
              {t('settings.username')}
            </label>
            <p className="text-white">{user?.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">
              {t('settings.email')}
            </label>
            <p className="text-white">{user?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">
              {t('settings.accountType')}
            </label>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
              {tipsterProfile ? t('settings.tipster') : t('settings.user')}
            </span>
          </div>
        </div>
      </div>

      {/* Tipster Profile */}
      {tipsterProfile && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t('settings.tipsterProfile')}</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm font-medium text-primary-500 bg-primary-500/10 rounded-lg hover:bg-primary-500/20 transition-colors"
              >
                {t('settings.editProfile')}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-neutral-300 mb-2">
                  {t('settings.displayName')} *
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-neutral-300 mb-2">
                  {t('settings.bioLabel')}
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('settings.bioPlaceholder')}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors disabled:opacity-50"
                >
                  {isSaving ? t('settings.saving') : t('settings.saveChanges')}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(tipsterProfile.displayName);
                    setBio(tipsterProfile.bio || '');
                  }}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  {t('settings.displayName')}
                </label>
                <p className="text-white">{tipsterProfile.displayName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  {t('settings.bioLabel')}
                </label>
                <p className="text-neutral-300">
                  {tipsterProfile.bio || <span className="text-neutral-500 italic">{t('settings.noBioSet')}</span>}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  {t('settings.tipsterId')}
                </label>
                <p className="text-neutral-400 font-mono text-sm">{tipsterProfile.id}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-neutral-900 rounded-xl border border-red-500/20 p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-4">{t('settings.dangerZone')}</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{t('settings.deleteAccount')}</p>
              <p className="text-sm text-neutral-500">
                {t('settings.deleteAccountWarning')}
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-medium opacity-50 cursor-not-allowed"
            >
              {t('settings.deleteAccount')}
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            {t('settings.deleteNotAvailable')}
          </p>
        </div>
      </div>
    </div>
  );
};
