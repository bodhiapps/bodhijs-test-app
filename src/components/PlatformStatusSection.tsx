import { BodhiPlatform, BodhiPlatformState } from '@bodhiapp/bodhijs';

interface PlatformStatusSectionProps {
  platform: BodhiPlatform | null;
  platformState: BodhiPlatformState | null;
  isInitializing: boolean;
  onRetryInitialization: () => void;
  onShowOnboarding: () => void;
}

export function PlatformStatusSection({
  platform,
  platformState,
  isInitializing,
  onRetryInitialization,
  onShowOnboarding,
}: PlatformStatusSectionProps) {
  const isReady = platformState?.isReady() || false;

  // Simple status determination for landing page - detailed info in modal
  const getStatus = () => {
    if (isInitializing) {
      return { status: 'detecting', title: 'Detecting Platform...', message: 'Checking for platform availability...' };
    }
    
    if (!platform) {
      return { status: 'error', title: 'Platform Not Available', message: 'Platform not available' };
    }
    
    if (isReady) {
      return { status: 'detected', title: 'Platform Ready', message: 'Platform ready - extension and server connected' };
    }
    
    return { status: 'setup', title: 'Platform Setup Required', message: 'Extension connected but server needs configuration' };
  };

  const status = getStatus();

  return (
    <div
      className={`extension-status ${status.status} ${!isInitializing ? 'done' : ''}`}
      data-testid="extension-status"
      style={{
        margin: '20px 0',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h3 style={{ color: '#333333', marginBottom: '16px' }}>
        BodhiPlatform Status
      </h3>

      {/* Simple status display - detailed info in modal */}
      <div style={{ marginBottom: '16px' }}>
        <p className="status-title" data-testid="status-title" style={{ color: '#333333', fontWeight: 'bold', margin: '8px 0' }}>
          {status.title}
        </p>
        <p className="status-message" style={{ color: '#666666', margin: '8px 0' }}>
          {status.message}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={onRetryInitialization}
          disabled={isInitializing}
          style={{
            padding: '10px 16px',
            backgroundColor: isInitializing ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isInitializing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {isInitializing ? 'Initializing...' : 'Retry Detection'}
        </button>

        {/* Always show modal button for status details */}
        <button
          data-testid="show-onboarding-modal"
          onClick={onShowOnboarding}
          style={{
            padding: '10px 16px',
            backgroundColor: isReady ? '#28a745' : '#ffc107',
            color: isReady ? 'white' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {isReady ? 'View Setup Details' : 'Setup Required'}
        </button>
      </div>

      {!platform && !isInitializing && (
        <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '12px' }}>
          Failed to initialize BodhiPlatform. Please ensure the browser extension is installed.
        </p>
      )}
    </div>
  );
}