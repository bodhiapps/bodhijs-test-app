import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { oauthManager } from '@/utils/oauth';

type ProcessingState =
  | { status: 'loading' }
  | { status: 'processing'; step: string }
  | { status: 'success' }
  | { status: 'error'; message: string };

/**
 * CallbackPage handles OAuth callback processing following React best practices:
 *
 * 1. Single useEffect with proper dependency array
 * 2. Consolidated state management
 * 3. Early returns for different states
 * 4. No artificial delays or timers
 * 5. Clean error handling
 * 6. Focus solely on OAuth token exchange
 */
function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<ProcessingState>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;

    const processCallback = async () => {
      try {
        setState({ status: 'processing', step: 'Processing OAuth callback...' });
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          const errorMessage = errorDescription || error;
          setState({
            status: 'error',
            message:
              errorMessage === 'access_denied'
                ? 'User denied access to the application'
                : `OAuth error: ${errorMessage}`,
          });
          return;
        }

        if (!code) {
          setState({ status: 'error', message: 'Authorization code not found' });
          return;
        }

        if (!state) {
          setState({ status: 'error', message: 'State parameter not found' });
          return;
        }

        setState({ status: 'processing', step: 'Exchanging authorization code for token...' });
        await oauthManager.exchangeCodeForTokens(code, state);
        if (!mounted) return;

        setState({ status: 'processing', step: 'Storing authentication tokens...' });
        // Note: fetchUserInfo will be called later when extension is available
        if (!mounted) return;
        setState({ status: 'success' });
        setTimeout(() => {
          if (mounted) {
            navigate('/');
          }
        }, 2000);
      } catch (error) {
        if (!mounted) return;
        console.error('OAuth callback processing failed:', error);
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };
    processCallback();
    return () => {
      mounted = false;
    };
  }, [searchParams, navigate]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Render different states
  if (state.status === 'loading') {
    return (
      <div>
        <h2>OAuth Callback</h2>
        <div className="status-message">Initializing...</div>
      </div>
    );
  }

  if (state.status === 'processing') {
    return (
      <div>
        <h2>OAuth Callback</h2>
        <div className="status-message">{state.step}</div>
        <div style={{ marginTop: '1rem' }}>
          <div className="spinner">Processing...</div>
        </div>
      </div>
    );
  }

  if (state.status === 'success') {
    return (
      <div>
        <h2>✓ Authentication Successful!</h2>
        <div className="status-message">✓ Authentication successful!</div>
        <div style={{ marginTop: '1rem' }}>
          <p>You have been successfully authenticated. Redirecting to home page...</p>
          <button onClick={handleReturnHome}>Return to Home</button>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div>
        <h2>✗ Authentication Failed</h2>
        <div className="status-message">{state.message}</div>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleRetry} style={{ marginRight: '1rem' }}>
            Retry
          </button>
          <button onClick={handleReturnHome}>Return to Home</button>
        </div>
      </div>
    );
  }

  return null;
}

export default CallbackPage;
