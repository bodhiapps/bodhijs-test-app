import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BodhiPlatform, BodhiExtClient } from '@bodhiapp/bodhijs';
import { oauthManager } from '@/utils/oauth';

type ApiStatus = 'ready' | 'calling' | 'streaming' | 'completed' | 'error';
type ExtensionStatus = 'detecting' | 'detected' | 'setup' | 'timeout' | 'error';

interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

interface StreamChunk {
  status?: number;
  headers?: Record<string, string>;
  body: any;
}

interface ApiTestState {
  extensionStatus: ExtensionStatus;
  extensionId: string | null;
  extensionError: string | null;
  apiStatus: ApiStatus;
  apiError: string | null;
  client: BodhiExtClient | null;

  // Form state
  method: string;
  endpoint: string;
  headers: string;
  body: string;
  includeAuth: boolean;
  streamingMode: boolean;

  // Response state
  response: ApiResponse | null;
  streamContent: string;
  isStreaming: boolean;
}

function ApiTestPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ApiTestState>({
    extensionStatus: 'detecting',
    extensionId: null,
    extensionError: null,
    apiStatus: 'ready',
    apiError: null,
    client: null,

    // Form defaults
    method: 'GET',
    endpoint: '/ping',
    headers: '',
    body: '',
    includeAuth: false,
    streamingMode: false,

    // Response defaults
    response: null,
    streamContent: '',
    isStreaming: false,
  });

  // Extension detection effect
  useEffect(() => {
    let mounted = true;

    const detectExtension = async () => {
      try {
        setState(prev => ({
          ...prev,
          extensionStatus: 'detecting',
          extensionId: null,
          extensionError: null,
        }));

        // Use BodhiPlatform for detection
        const platform = new BodhiPlatform({ timeout: 3000 });
        const platformState = await platform.initialize();

        if (!mounted) return;

        if (platformState.isReady()) {
          // Platform is ready, get client and extension ID
          const client = platform.getClient();
          const extensionId = client.getExtensionId();

          setState(prev => ({
            ...prev,
            extensionStatus: 'detected',
            client,
            extensionId,
            extensionError: null,
          }));
        } else {
          // Platform needs setup - simplified error handling
          let client: BodhiExtClient | null = null;
          let extensionId: string | null = null;

          // Try to get client if possible for setup state
          try {
            client = platform.getClient();
            extensionId = client.getExtensionId();
            // If we get here, extension works but server needs setup
            setState(prev => ({
              ...prev,
              extensionStatus: 'setup',
              client,
              extensionId,
              extensionError: null,
            }));
          } catch {
            // Platform not ready and client not available
            setState(prev => ({
              ...prev,
              extensionStatus: 'error',
              extensionError:
                'Platform not ready. Please ensure the Bodhi browser extension is installed and the server is running.',
            }));
          }
        }
      } catch (error) {
        if (!mounted) return;

        const errorMessage = error instanceof Error ? error.message : String(error);

        setState(prev => ({
          ...prev,
          extensionStatus: 'error',
          extensionError: errorMessage,
        }));
      }
    };

    detectExtension();

    return () => {
      mounted = false;
    };
  }, []);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!state.client) {
      setState(prev => ({
        ...prev,
        apiError: 'Extension not available. Please ensure the extension is detected.',
      }));
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        apiError: null,
        response: null,
        streamContent: '',
        isStreaming: false,
      }));

      // Parse headers
      const headers: Record<string, string> = {};
      if (state.headers.trim()) {
        state.headers.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            headers[key.trim()] = valueParts.join(':').trim();
          }
        });
      }

      // Add authentication header if requested
      if (state.includeAuth) {
        const accessToken = oauthManager.getAccessToken();
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
          setState(prev => ({
            ...prev,
            apiError: 'Authentication requested but no access token found. Please login first.',
          }));
          return;
        }
      }

      // Parse body
      let bodyData: any = undefined;
      if (state.body.trim()) {
        try {
          bodyData = JSON.parse(state.body);
        } catch {
          // If not valid JSON, send as string
          bodyData = state.body;
        }
      }

      if (state.streamingMode) {
        await handleStreamingRequest(state.method, state.endpoint, bodyData, headers);
      } else {
        await handleStandardRequest(state.method, state.endpoint, bodyData, headers);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        apiStatus: 'error',
        apiError: error instanceof Error ? error.message : String(error),
      }));
    }
  };

  const handleStandardRequest = async (
    method: string,
    endpoint: string,
    body: any,
    headers: Record<string, string>
  ) => {
    if (!state.client) return;

    setState(prev => ({ ...prev, apiStatus: 'calling' }));

    try {
      const response = await state.client.sendApiRequest(method, endpoint, body, headers);

      setState(prev => ({
        ...prev,
        apiStatus: 'completed',
        response: {
          status: response.status,
          headers: response.headers,
          body: response.body,
        },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        apiStatus: 'error',
        apiError: error instanceof Error ? error.message : String(error),
      }));
    }
  };

  const handleStreamingRequest = async (
    method: string,
    endpoint: string,
    body: any,
    headers: Record<string, string>
  ) => {
    if (!state.client) return;

    setState(prev => ({
      ...prev,
      apiStatus: 'calling',
      isStreaming: true,
      streamContent: '',
    }));

    try {
      // Ensure streaming body has stream: true
      if (typeof body === 'object' && body !== null) {
        body.stream = true;
      }

      const stream = await state.client.sendStreamRequest(method, endpoint, body, headers);

      setState(prev => ({ ...prev, apiStatus: 'streaming' }));

      let lastChunk: StreamChunk | null = null;
      for await (const chunk of stream) {
        lastChunk = chunk;

        // Update stream content
        if (chunk.body?.choices?.[0]?.delta?.content) {
          setState(prev => ({
            ...prev,
            streamContent: prev.streamContent + chunk.body.choices[0].delta.content,
          }));
        }
      }

      setState(prev => ({
        ...prev,
        apiStatus: 'completed',
        isStreaming: false,
        response: lastChunk
          ? {
              status: lastChunk.status || 200,
              headers: lastChunk.headers || {},
              body: lastChunk.body,
            }
          : null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        apiStatus: 'error',
        isStreaming: false,
        apiError: error instanceof Error ? error.message : String(error),
      }));
    }
  };

  const handleClearOutput = () => {
    setState(prev => ({
      ...prev,
      response: null,
      streamContent: '',
      apiError: null,
      apiStatus: 'ready',
      isStreaming: false,
    }));
  };

  const handleRetryExtension = () => {
    window.location.reload();
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getExtensionStatusClass = () => {
    return `status-indicator status-${state.extensionStatus}`;
  };

  const getApiStatusClass = () => {
    return `status-indicator status-${state.apiStatus}`;
  };

  const getExtensionStatusText = () => {
    switch (state.extensionStatus) {
      case 'detecting':
        return 'Detecting...';
      case 'detected':
        return `Ready ✓ (ID: ${state.extensionId})`;
      case 'setup':
        return `Setup Required ⚠ (ID: ${state.extensionId || 'N/A'})`;
      case 'timeout':
        return 'Timeout ✗';
      case 'error':
        return 'Not found ✗';
      default:
        return 'Unknown';
    }
  };

  const getApiStatusText = () => {
    switch (state.apiStatus) {
      case 'ready':
        return 'Ready';
      case 'calling':
        return 'Calling API...';
      case 'streaming':
        return 'Streaming...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error occurred';
      default:
        return 'Unknown';
    }
  };

  const formatResponseBody = (body: any): string => {
    if (body === null || body === undefined) {
      return 'No body received';
    }

    try {
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  };

  const formatHeaders = (headers: Record<string, string>): string => {
    if (!headers || Object.keys(headers).length === 0) {
      return 'No headers received';
    }

    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>API Test Interface</h1>
        <p>Configure and send API requests through the Bodhi extension</p>
        <button
          onClick={handleBackToHome}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          ← Back to Home
        </button>
      </div>

      {/* Status Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Status</h3>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>Extension: </span>
            <span className={getExtensionStatusClass()} data-testid="extension-status">
              {getExtensionStatusText()}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 'bold' }}>API: </span>
            <span className={getApiStatusClass()} data-testid="api-status">
              {getApiStatusText()}
            </span>
          </div>
        </div>

        {state.extensionError && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ffe6e6',
              border: '1px solid #ff6b6b',
              borderRadius: '4px',
              color: '#d63031',
              marginBottom: '1rem',
            }}
          >
            <strong>Extension Error:</strong> {state.extensionError}
            <button
              onClick={handleRetryExtension}
              style={{
                marginLeft: '1rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {state.apiError && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ffe6e6',
              border: '1px solid #ff6b6b',
              borderRadius: '4px',
              color: '#d63031',
              marginBottom: '1rem',
            }}
          >
            <strong>API Error:</strong> {state.apiError}
          </div>
        )}
      </div>

      {/* API Configuration Form */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>API Request Configuration</h3>
        <form
          onSubmit={handleFormSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {/* Request Configuration */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: '0 0 120px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                HTTP Method
              </label>
              <select
                value={state.method}
                onChange={e => setState(prev => ({ ...prev, method: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                data-testid="api-method"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                API Endpoint
              </label>
              <input
                type="text"
                value={state.endpoint}
                onChange={e => setState(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="/ping"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                data-testid="api-endpoint"
                required
              />
            </div>
          </div>

          {/* Request Body */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Request Body (JSON)
            </label>
            <textarea
              value={state.body}
              onChange={e => setState(prev => ({ ...prev, body: e.target.value }))}
              placeholder='{"message": "Hello, world!"}'
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
              data-testid="api-body"
            />
          </div>

          {/* Custom Headers */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Custom Headers (one per line)
            </label>
            <textarea
              value={state.headers}
              onChange={e => setState(prev => ({ ...prev, headers: e.target.value }))}
              placeholder="X-Custom-Header: value&#10;Content-Type: application/json"
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
              data-testid="api-headers"
            />
          </div>

          {/* Request Options */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Request Options
            </label>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={state.streamingMode}
                  onChange={e => setState(prev => ({ ...prev, streamingMode: e.target.checked }))}
                  data-testid="streaming-mode"
                />
                Enable Streaming
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={state.includeAuth}
                  onChange={e => setState(prev => ({ ...prev, includeAuth: e.target.checked }))}
                  data-testid="include-auth"
                />
                Include Authentication Token
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={
                (state.extensionStatus !== 'detected' && state.extensionStatus !== 'setup') ||
                state.apiStatus === 'calling' ||
                state.apiStatus === 'streaming'
              }
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor:
                  state.extensionStatus !== 'detected' && state.extensionStatus !== 'setup'
                    ? '#ccc'
                    : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor:
                  state.extensionStatus !== 'detected' && state.extensionStatus !== 'setup'
                    ? 'not-allowed'
                    : 'pointer',
              }}
              data-testid="submit-api-request"
            >
              Send API Request
            </button>
            <button
              type="button"
              onClick={handleClearOutput}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              data-testid="clear-output"
            >
              Clear Output
            </button>
          </div>
        </form>
      </div>

      {/* Stream Content (only visible during streaming) */}
      {(state.isStreaming || state.streamContent) && (
        <div style={{ marginBottom: '2rem' }} data-testid="stream-section">
          <h3>Stream Content</h3>
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              minHeight: '100px',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
            data-testid="stream-content"
          >
            {state.streamContent || 'Waiting for stream data...'}
          </div>
        </div>
      )}

      {/* Response Output */}
      <div>
        <h3>Response</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h4>Status:</h4>
            <pre
              style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                margin: 0,
              }}
              data-testid="response-status"
            >
              {state.response ? state.response.status : '(no response yet)'}
            </pre>
          </div>
          <div>
            <h4>Headers:</h4>
            <pre
              style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
              data-testid="response-headers"
            >
              {state.response ? formatHeaders(state.response.headers) : '(no response yet)'}
            </pre>
          </div>
          <div>
            <h4>Body:</h4>
            <pre
              style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                margin: 0,
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflowY: 'auto',
              }}
              data-testid="response-body"
            >
              {state.response ? formatResponseBody(state.response.body) : '(no response yet)'}
            </pre>
          </div>
        </div>
      </div>

      <style>{`
        .status-indicator {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: bold;
        }
        .status-detecting, .status-calling, .status-streaming {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-detected, .status-ready, .status-completed {
          background-color: #d4edda;
          color: #155724;
        }
        .status-setup {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-error, .status-timeout {
          background-color: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
}

export default ApiTestPage;
