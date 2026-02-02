import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tipsterApi } from '../../api/tipster.api';
import { Tipster } from '../../types/tipster.types';

export const SettingsPage = () => {
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
      setMessage({ type: 'error', text: 'Display name is required' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (!tipsterProfile) {
        setMessage({ type: 'error', text: 'No tipster profile found' });
        return;
      }
      await tipsterApi.updateTipster(tipsterProfile.id, { displayName, bio });
      setTipsterProfile((prev) => prev ? { ...prev, displayName, bio } : prev);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-neutral-400 mt-1">
          Manage your account and tipster profile settings
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
        <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">
              Username
            </label>
            <p className="text-white">{user?.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">
              Email
            </label>
            <p className="text-white">{user?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1">
              Account Type
            </label>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
              {tipsterProfile ? 'Tipster' : 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Tipster Profile */}
      {tipsterProfile && (
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Tipster Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-sm font-medium text-primary-500 bg-primary-500/10 rounded-lg hover:bg-primary-500/20 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-neutral-300 mb-2">
                  Display Name *
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
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about your betting expertise..."
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary-500 text-neutral-950 rounded-lg font-medium hover:bg-primary-400 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(tipsterProfile.displayName);
                    setBio(tipsterProfile.bio || '');
                  }}
                  className="px-4 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  Display Name
                </label>
                <p className="text-white">{tipsterProfile.displayName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  Bio
                </label>
                <p className="text-neutral-300">
                  {tipsterProfile.bio || <span className="text-neutral-500 italic">No bio set</span>}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-500 mb-1">
                  Tipster ID
                </label>
                <p className="text-neutral-400 font-mono text-sm">{tipsterProfile.id}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-neutral-900 rounded-xl border border-red-500/20 p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-neutral-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-medium opacity-50 cursor-not-allowed"
            >
              Delete Account
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            Account deletion is currently not available. Please contact support if needed.
          </p>
        </div>
      </div>
    </div>
  );
};
