import { AuthenticationState } from '@/hooks/useAuthentication';

interface AuthenticationStatusSectionProps {
  authState: AuthenticationState;
  onNavigateToApiTest: () => void;
}

export function AuthenticationStatusSection({
  authState,
  onNavigateToApiTest,
}: AuthenticationStatusSectionProps) {

  return (
    <div
      className={`auth-status ${authState.status}`}
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
        Authentication Status
      </h3>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#333333', margin: '8px 0' }}>
          <strong>Status:</strong>{' '}
          {authState.status === 'unauthenticated' && (
            <span style={{ color: '#ffc107' }}>⚠️ Not authenticated</span>
          )}
          {authState.status === 'authenticating' && (
            <span style={{ color: '#007bff' }}>🔍 Authenticating...</span>
          )}
          {authState.status === 'authenticated' && (
            <span style={{ color: '#28a745' }}>✅ Authenticated</span>
          )}
          {authState.status === 'error' && (
            <span style={{ color: '#dc3545' }}>❌ Authentication error</span>
          )}
        </p>

        {authState.userInfo && (
          <div style={{ 
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px'
          }}>
            <p style={{ color: '#333333', margin: '4px 0' }}>
              <strong>Email:</strong> {authState.userInfo.email}
            </p>
            <p style={{ color: '#333333', margin: '4px 0' }}>
              <strong>Role:</strong> {authState.userInfo.role}
            </p>
          </div>
        )}

        {authState.error && (
          <p style={{ color: '#dc3545', margin: '8px 0', fontSize: '14px' }}>
            <strong>Error:</strong> {authState.error}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {authState.status === 'unauthenticated' || authState.status === 'error' ? (
          <button
            onClick={authState.login}
            style={{
              padding: '10px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            data-testid="login-button"
          >
            Log In
          </button>
        ) : authState.status === 'authenticated' ? (
          <>
            <button
              onClick={onNavigateToApiTest}
              style={{
                padding: '10px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Go to API Test
            </button>
            <button
              onClick={authState.logout}
              style={{
                padding: '10px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Log Out
            </button>
          </>
        ) : authState.status === 'authenticating' ? (
          <p style={{ color: '#007bff', margin: '0' }}>
            Processing authentication...
          </p>
        ) : null}
      </div>

      {authState.status === 'unauthenticated' && (
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#6c757d' }}>
          <p>
            Click "Log In" to start the OAuth authentication flow. You'll be redirected 
            to the Bodhi authentication server to enter your credentials.
          </p>
        </div>
      )}
    </div>
  );
}