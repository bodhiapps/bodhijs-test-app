import { BodhiPlatformState } from '@bodhiapp/bodhijs';

interface ServerStatusProps {
  platformState: BodhiPlatformState | null;
  onRefresh: () => void;
}

export function ServerStatus({ platformState, onRefresh }: ServerStatusProps) {
  if (!platformState) {
    return (
      <div className="server-state" style={{ marginTop: '1rem' }}>
        <div className="status-title">Server State</div>
        <div className="status-message">Status: <strong>unknown</strong></div>
        <button
          onClick={onRefresh}
          style={{
            marginTop: '0.5rem',
            padding: '0.25rem 0.5rem',
            fontSize: '0.8rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
        >
          Refresh Server State
        </button>
      </div>
    );
  }

  const isReady = platformState.isReady();

  return (
    <div className={`server-state ${isReady ? 'ready' : 'setup'}`} style={{ marginTop: '1rem' }}>
      <div className="status-title">Server State</div>
      <div className="status-message">
        Status: <strong>{isReady ? 'ready' : 'setup required'}</strong>
      </div>

      {!isReady && (
        <div
          className="error-details"
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            fontSize: '0.9rem',
          }}
        >
          <strong>Note:</strong> Platform needs setup to be fully functional
        </div>
      )}

      <button
        onClick={onRefresh}
        style={{
          marginTop: '0.5rem',
          padding: '0.25rem 0.5rem',
          fontSize: '0.8rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
        }}
      >
        Refresh Server State
      </button>
    </div>
  );
}
