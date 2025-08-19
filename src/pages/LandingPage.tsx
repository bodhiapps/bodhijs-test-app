import { useState, useEffect } from 'react';
import { BodhiPlatform, BodhiPlatformState, BodhiExtClient } from '@bodhiapp/bodhijs';
import { PlatformStatusSection } from '@/components/PlatformStatusSection';
import { AuthenticationStatusSection } from '@/components/AuthenticationStatusSection';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<BodhiPlatform | null>(null);
  const [platformState, setPlatformState] = useState<BodhiPlatformState | null>(null);
  const [client, setClient] = useState<BodhiExtClient | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Create a mock platform detection state for the authentication hook
  const mockPlatformState = {
    status: platformState?.isReady() ? 'detected' as const : 'setup' as const,
    platform,
    client,
    extensionId: client?.getExtensionId() || null,
    error: null,
    platformState,
  };

  const authState = useAuthentication(mockPlatformState);

  const initializePlatform = async () => {
    setIsInitializing(true);
    try {
      const newPlatform = new BodhiPlatform({ timeout: 3000 });
      const state = await newPlatform.initialize();
      
      setPlatform(newPlatform);
      setPlatformState(state);
      
      if (state.isReady()) {
        const newClient = newPlatform.getClient();
        setClient(newClient);
      } else {
        setClient(null);
      }
    } catch (error) {
      console.error('Platform initialization failed:', error);
      setPlatform(null);
      setPlatformState(null);
      setClient(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleNavigateToApiTest = () => {
    navigate('/api-test');
  };

  const handleShowOnboarding = () => {
    if (platform) {
      platform.showOnboarding({
        dismissible: true,
        callbacks: {
          onClose: async (_state, action) => {
            if (action === 'complete') {
              // Re-initialize platform after onboarding completion
              await initializePlatform();
            }
          },
        },
      });
    }
  };

  // Initialize platform on component mount
  useEffect(() => {
    initializePlatform();
  }, []);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        color: '#333333', 
        textAlign: 'center', 
        marginBottom: '2rem' 
      }}>
        Bodhi JS Sample Integration
      </h1>
      
      <p style={{ 
        color: '#666666', 
        textAlign: 'center', 
        marginBottom: '2rem',
        fontSize: '16px'
      }}>
        This demonstrates how to integrate the @bodhiapp/bodhijs library in your web application.
      </p>

      {/* Platform Status Section */}
      <PlatformStatusSection
        platform={platform}
        platformState={platformState}
        isInitializing={isInitializing}
        onRetryInitialization={initializePlatform}
        onShowOnboarding={handleShowOnboarding}
      />

      {/* Simple Server State Indicator for Test */}
      <div
        className={`server-status ${platformState?.isReady() ? 'ready' : 'not-ready'}`}
        style={{
          margin: '10px 0',
          padding: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          fontStyle: 'italic'
        }}
      >
        {platformState?.isReady() 
          ? 'Server connectivity: Ready (details in setup modal)' 
          : 'Server connectivity: Check setup modal for details'
        }
      </div>

      {/* Authentication Section - Only show when platform is ready */}
      {client && platformState?.isReady() && (
        <AuthenticationStatusSection
          authState={authState}
          onNavigateToApiTest={handleNavigateToApiTest}
        />
      )}

    </div>
  );
}

export default LandingPage;
