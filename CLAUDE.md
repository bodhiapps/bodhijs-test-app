# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the bodhijs-test-app project.

## Project Overview

The **bodhijs-test-app** is a React-based test application for validating the @bodhiapp/bodhijs library integration. It provides a comprehensive testing interface for extension detection, OAuth authentication flows, and API communication patterns. The application serves as both a development tool and integration validation environment for the BodhiJS library.

### Key Features
- 🔍 **Extension Detection**: Real-time extension availability monitoring
- 🔐 **OAuth Testing**: Complete authentication flow validation
- 🌊 **API Testing**: Request/response testing with streaming support
- 📊 **Status Dashboard**: Platform state visualization and monitoring
- 🧪 **Integration Validation**: End-to-end library testing scenarios
- ⚡ **Modern Stack**: React 19 + Vite + React Router + TypeScript

## Development Commands

### Core Commands
- `npm install` - Install dependencies
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production with TypeScript compilation
- `npm run build:fast` - Fast build with dependency management
- `npm run serve` - Build and serve on port 12345
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks

### Makefile Commands
- `make all` - Setup, lint-fix, and build
- `make setup` - Install dependencies with exact versions
- `make build-fast` - Fast build with change detection
- `make dependencies-fast` - Build @bodhiapp/bodhijs library dependency
- `make clean` - Clean build artifacts

### Task Completion Verification
- Always test with browser extension loaded and enabled
- Run `npm run serve` to test on the required port 12345
- Verify extension detection and API communication work correctly
- Test OAuth flow end-to-end with real authentication

## Architecture Overview

### Technology Stack
- **Framework**: React 19 with functional components and hooks
- **Build Tool**: Vite 7 for fast development and building
- **Routing**: React Router DOM 7 for multi-page navigation
- **Language**: TypeScript 5.8 for type safety
- **Library Integration**: @bodhiapp/bodhijs for extension communication
- **Port**: Fixed port 12345 for integration test compatibility

### Application Architecture
The application follows a modern React architecture with clean separation of concerns:

1. **Page Components** (`src/pages/`)
   - `LandingPage.tsx`: Main entry point with platform status
   - `ApiTestPage.tsx`: API testing interface and request builder
   - `CallbackPage.tsx`: OAuth callback handling and token management

2. **Shared Components** (`src/components/`)
   - `PlatformStatusSection.tsx`: Platform state display and monitoring
   - `AuthenticationStatusSection.tsx`: Authentication status and controls
   - `PlatformStatus.tsx`: Individual platform component status
   - `ServerStatus.tsx`: Server connectivity and health monitoring

3. **Custom Hooks** (`src/hooks/`)
   - `usePlatformDetection.ts`: Extension and platform detection logic
   - `useAuthentication.ts`: OAuth flow management and token handling

4. **Utilities** (`src/utils/`)
   - `oauth.ts`: OAuth flow utilities and PKCE implementation

### Platform Detection Flow
```typescript
// Extension detection with error handling
const usePlatformDetection = () => {
  const [platform, setPlatform] = useState<BodhiPlatform | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializePlatform = async () => {
      try {
        const bodhiPlatform = new BodhiPlatform();
        const state = await bodhiPlatform.initialize();
        setPlatform(bodhiPlatform);
      } catch (err) {
        setError(err.message);
      }
    };
    
    initializePlatform();
  }, []);
  
  return { platform, error };
};
```

## Code Architecture

### Project Structure
```
bodhijs-test-app/
├── src/
│   ├── App.tsx                     # Main application component with routing
│   ├── main.tsx                    # React application entry point
│   ├── index.css                   # Global styles and CSS variables
│   ├── components/                 # Reusable React components
│   │   ├── AuthenticationStatusSection.tsx  # Auth status display
│   │   ├── PlatformStatus.tsx              # Platform component status
│   │   ├── PlatformStatusSection.tsx       # Platform overview
│   │   └── ServerStatus.tsx               # Server connectivity status
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuthentication.ts           # OAuth flow management
│   │   └── usePlatformDetection.ts        # Platform detection logic
│   ├── lib/                        # Type definitions and utilities
│   │   └── onboarding-types.ts           # Onboarding type definitions
│   ├── pages/                      # Page components
│   │   ├── ApiTestPage.tsx               # API testing interface
│   │   ├── CallbackPage.tsx              # OAuth callback handling
│   │   └── LandingPage.tsx               # Main application page
│   └── utils/                      # Utility functions
│       └── oauth.ts                      # OAuth utilities and helpers
├── dist/                           # Built application (generated)
├── index.html                      # HTML template
└── vite.config.ts                  # Vite configuration
```

### Key Files to Understand
- `src/App.tsx:1-50` - Main application routing and layout
- `src/hooks/usePlatformDetection.ts` - Core extension detection logic
- `src/hooks/useAuthentication.ts` - OAuth flow implementation
- `src/pages/LandingPage.tsx` - Primary testing interface
- `src/components/PlatformStatusSection.tsx` - Platform status visualization

### BodhiJS Library Integration
```typescript
// Platform initialization
import { BodhiPlatform } from '@bodhiapp/bodhijs';

const platform = new BodhiPlatform();
const state = await platform.initialize();

if (state.isReady()) {
  const client = platform.getClient();
  // Use client for API calls
} else {
  // Handle setup requirements
  platform.showOnboarding();
}
```

## Testing Architecture

### Manual Testing Interface
The application provides comprehensive manual testing capabilities:

1. **Extension Detection Testing**
   - Real-time extension availability status
   - Connection state monitoring
   - Error condition simulation

2. **API Testing Interface**
   - Request builder with customizable parameters
   - Response display with streaming support
   - Error handling and retry mechanisms

3. **Authentication Testing**
   - OAuth flow initiation and completion
   - Token management and validation
   - Authentication error scenarios

4. **Platform Status Monitoring**
   - Server connectivity checks
   - Extension communication validation
   - Real-time status updates

### Integration Testing Support
The application is designed to support automated integration testing:
- **Fixed Port**: Always runs on port 12345 for test consistency
- **Predictable URLs**: Clean routing for automated navigation
- **Status Endpoints**: Programmatic access to platform state
- **Error Handling**: Comprehensive error reporting for test validation

## Development Guidelines

### Code Style
- **React Patterns**: Functional components with hooks
- **TypeScript**: Strict typing with comprehensive interfaces
- **Component Design**: Single responsibility with clear props
- **State Management**: Local state with hooks, global state when needed
- **Error Handling**: Graceful degradation with user feedback

### Library Integration Patterns
```typescript
// Recommended: Use platform detection hook
const { platform, error } = usePlatformDetection();

// Handle different platform states
if (error) {
  return <ErrorDisplay error={error} />;
}

if (!platform) {
  return <LoadingSpinner />;
}

if (!platform.isReady()) {
  return <SetupRequired onSetup={() => platform.showOnboarding()} />;
}

// Platform is ready for API calls
const client = platform.getClient();
```

### Authentication Flow Implementation
```typescript
// OAuth flow with proper error handling
const useAuthentication = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const startOAuthFlow = async () => {
    try {
      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = generatePKCE();
      
      // Store verifier for callback
      sessionStorage.setItem('code_verifier', codeVerifier);
      
      // Redirect to OAuth server
      window.location.href = buildAuthUrl(codeChallenge);
    } catch (error) {
      console.error('OAuth initiation failed:', error);
    }
  };
  
  return { isAuthenticated, token, startOAuthFlow };
};
```

## Integration Points

### With @bodhiapp/bodhijs Library
- Primary consumer of the BodhiJS library API
- Tests all major library features and error conditions
- Validates library behavior in real browser environment
- Provides feedback for library development and debugging

### With bodhi-browser-ext
- Indirectly tests extension through BodhiJS library
- Validates extension detection and communication
- Tests API request/response flows through extension
- Provides manual testing interface for extension features

### With Integration Test Infrastructure
- Serves as target application for automated testing
- Provides consistent port (12345) for test automation
- Supports headless browser testing scenarios
- Integrates with Playwright and other testing frameworks

### With OAuth Authentication
- Implements complete OAuth2 + PKCE flow
- Tests authentication integration through extension
- Validates token handling and API authentication
- Provides OAuth debugging and troubleshooting interface

## Common Workflows

### Testing Library Changes
1. Build updated library: `make -C ../bodhi-js build-fast`
2. Start test app: `npm run serve`
3. Navigate to http://localhost:12345
4. Test extension detection and platform initialization
5. Validate API communication and error handling

### Debugging Extension Issues
1. Open browser DevTools console
2. Monitor platform status section for real-time updates
3. Check extension detection status and error messages
4. Test API calls through the testing interface
5. Review network tab for extension communication

### Adding New Test Scenarios
1. Create new page component for specific test case
2. Add routing in `src/App.tsx`
3. Implement test logic with proper error handling
4. Add navigation and status monitoring
5. Update documentation with test procedure

### OAuth Flow Testing
1. Configure OAuth settings in test interface
2. Initiate authentication flow
3. Complete OAuth authorization
4. Verify callback handling and token extraction
5. Test authenticated API calls

### Platform State Validation
1. Monitor platform status section
2. Test different browser/extension configurations
3. Validate error handling for missing components
4. Test platform recovery after component installation
5. Verify state persistence across page reloads

## Performance Considerations

### Development Performance
- Vite for fast development server startup
- Hot module replacement for rapid iteration
- TypeScript incremental compilation
- Optimized dependency loading

### Runtime Performance
- React 19 with concurrent features
- Efficient state management with hooks
- Optimized re-rendering with proper dependencies
- Lightweight component architecture

### Build Performance
- Fast build system with change detection
- Incremental TypeScript compilation
- Optimized production builds with Vite
- Tree shaking for minimal bundle size

## Troubleshooting

### Common Issues
1. **Extension Not Detected**: Verify extension is installed and enabled
2. **Port 12345 Conflicts**: Ensure no other services are using port 12345
3. **OAuth Failures**: Check OAuth configuration and callback URLs
4. **API Errors**: Verify local server is running and accessible
5. **Build Failures**: Ensure @bodhiapp/bodhijs dependency is built

### Development Tips
- Always test with browser extension loaded
- Use browser DevTools for debugging extension communication
- Monitor console for library error messages
- Test OAuth flow with real authentication server
- Verify platform state changes with status monitoring

This test application serves as the primary validation environment for the BodhiJS library, providing comprehensive testing capabilities while demonstrating proper integration patterns for developers.