import { PlatformDetectionState } from '@/hooks/usePlatformDetection';

interface PlatformStatusProps {
  platformState: PlatformDetectionState;
  onRetry: () => void;
}

export function PlatformStatus({ platformState, onRetry }: PlatformStatusProps) {
  const getStatusClassName = () => `extension-status ${platformState.status}`;

  const getStatusTitle = () => {
    switch (platformState.status) {
      case 'detecting':
        return 'Detecting Platform...';
      case 'detected':
        return 'Platform Ready';
      case 'setup':
        return 'Platform Setup Required';
      case 'timeout':
        return 'Extension Timeout';
      case 'error':
        return 'Platform Not Available';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusMessage = () => {
    switch (platformState.status) {
      case 'detecting':
        return 'Initializing Bodhi Platform...';
      case 'detected':
        return 'Platform ready - extension and server connected';
      case 'setup':
        return 'Extension connected but server needs configuration';
      case 'timeout':
        return 'Extension found but not responding';
      case 'error':
        return 'Platform not available';
      default:
        return '';
    }
  };

  const showRetryButton = platformState.status === 'error' || platformState.status === 'timeout';
  const showSetupMessage = platformState.status === 'setup';
  const showInstallationInstructions = platformState.status === 'error';

  return (
    <>
      <div className={getStatusClassName()} data-testid="platform-status">
        <div className="status-title" data-testid="platform-status-title">
          {getStatusTitle()}
        </div>
        <div className="status-message" data-testid="platform-status-message">
          {getStatusMessage()}
        </div>

        {platformState.extensionId && (
          <div className="extension-id" data-testid="extension-id">
            Extension ID: {platformState.extensionId}
          </div>
        )}

        {platformState.platformState && (
          <div
            className="platform-state"
            data-testid="platform-state-details"
            style={{ marginTop: '0.5rem' }}
          >
            <div data-testid="platform-ready-status">
              Platform Ready: <strong>{platformState.platformState.isReady() ? 'Yes' : 'No'}</strong>
            </div>
          </div>
        )}

        {platformState.error && (
          <div
            className="status-message"
            data-testid="platform-error-message"
            style={{ marginTop: '0.5rem', color: '#ff6b6b' }}
          >
            {platformState.error}
          </div>
        )}

        {showRetryButton && (
          <button
            data-testid="retry-detection-button"
            onClick={onRetry}
            style={{ marginTop: '1rem' }}
          >
            Retry Detection
          </button>
        )}

        {showSetupMessage && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
            }}
          >
            <strong>Setup Required:</strong> The extension is connected but the server needs
            configuration. You can still test some features.
          </div>
        )}
      </div>

      {showInstallationInstructions && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Installation Required</h2>
          <p>To use this test application, please:</p>
          <ol style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Install the Bodhi browser extension</li>
            <li>Ensure the extension is enabled</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      )}
    </>
  );
}
