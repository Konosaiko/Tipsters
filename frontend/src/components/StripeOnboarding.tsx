import { useState, useEffect } from 'react';
import {
  getStripeStatus,
  startStripeOnboarding,
  getStripeDashboardLink,
  refreshStripeStatus,
  StripeAccountStatus,
} from '../api/stripe.api';

export function StripeOnboarding() {
  const [status, setStatus] = useState<StripeAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      setLoading(true);
      const data = await getStripeStatus();
      setStatus(data);
    } catch (err) {
      setError('Failed to load Stripe status');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartOnboarding() {
    try {
      setActionLoading(true);
      setError(null);
      const currentUrl = window.location.href;
      const { url } = await startStripeOnboarding(currentUrl, currentUrl);
      window.location.href = url;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start onboarding');
      setActionLoading(false);
    }
  }

  async function handleOpenDashboard() {
    try {
      setActionLoading(true);
      const { url } = await getStripeDashboardLink();
      window.open(url, '_blank');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to open dashboard');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setActionLoading(true);
      const data = await refreshStripeStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to refresh status');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Payment Setup</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!status?.hasAccount && (
        <div>
          <p className="text-gray-600 mb-4">
            To receive payments from subscribers, you need to connect your Stripe
            account. This is a one-time setup process.
          </p>
          <button
            onClick={handleStartOnboarding}
            disabled={actionLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {actionLoading ? 'Loading...' : 'Connect with Stripe'}
          </button>
        </div>
      )}

      {status?.hasAccount && !status.onboardingComplete && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full"></span>
            <span className="text-yellow-700 font-medium">Onboarding incomplete</span>
          </div>
          <p className="text-gray-600 mb-4">
            Please complete your Stripe account setup to start receiving payments.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleStartOnboarding}
              disabled={actionLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {actionLoading ? 'Loading...' : 'Continue Setup'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={actionLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}

      {status?.onboardingComplete && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-green-700 font-medium">Account connected</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-500">Charges:</span>{' '}
              <span className={status.chargesEnabled ? 'text-green-600' : 'text-red-600'}>
                {status.chargesEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Payouts:</span>{' '}
              <span className={status.payoutsEnabled ? 'text-green-600' : 'text-red-600'}>
                {status.payoutsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenDashboard}
            disabled={actionLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {actionLoading ? 'Loading...' : 'Open Stripe Dashboard'}
          </button>
        </div>
      )}
    </div>
  );
}
