import { useState, useEffect } from 'react';
import { BodhiPlatform, BodhiExtClient, BodhiPlatformState } from '@bodhiapp/bodhijs';

export type PlatformDetectionStatus = 'detecting' | 'detected' | 'setup' | 'timeout' | 'error';

export interface PlatformDetectionState {
  status: PlatformDetectionStatus;
  platform: BodhiPlatform | null;
  client: BodhiExtClient | null;
  extensionId: string | null;
  error: string | null;
  platformState: BodhiPlatformState | null;
}

export function usePlatformDetection(): PlatformDetectionState {
  const [state, setState] = useState<PlatformDetectionState>({
    status: 'detecting',
    platform: null,
    client: null,
    extensionId: null,
    error: null,
    platformState: null,
  });

  useEffect(() => {
    let mounted = true;

    const detectPlatform = async () => {
      try {
        setState(prev => ({ ...prev, status: 'detecting' }));

        const platform = new BodhiPlatform({ timeout: 3000 });
        const platformState = await platform.initialize();

        if (!mounted) return;

        // Determine UI status based on platform state - simplified with isReady()
        const uiState = determineUIState(platformState);

        let client = null;
        let extensionId = null;

        // Try to get client if platform is ready
        if (platformState.isReady()) {
          try {
            client = platform.getClient();
            extensionId = client.getExtensionId();
          } catch {
            // Client not available, continue with null
          }
        }

        setState({
          status: uiState.status,
          platform,
          client,
          extensionId,
          error: uiState.error,
          platformState,
        });
      } catch (error) {
        if (!mounted) return;
        setState({
          status: 'error',
          platform: null,
          client: null,
          extensionId: null,
          error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          platformState: null,
        });
      }
    };

    detectPlatform();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

function determineUIState(platformState: BodhiPlatformState): {
  status: PlatformDetectionStatus;
  error: string | null;
} {
  // Simplified state determination using isReady()
  if (platformState.isReady()) {
    return { status: 'detected', error: null };
  }

  // For non-ready states, we'll use a simpler approach
  // Since detailed error information is no longer exposed,
  // we'll provide general guidance
  // If we can't get a client, the platform needs setup
  return { status: 'setup', error: null };
}
