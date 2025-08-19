# Bodhi JS Test App React

A React test application for testing the @bodhiapp/bodhijs library with extension detection, OAuth flow, and API testing capabilities.

## Features

- Extension detection with proper error handling
- React + Vite + React Router setup
- TypeScript support
- Basic CSS styling for status display

## Development

```bash
# Install dependencies
npm install

# Start development server (runs on port 12345)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Requirements

- Bodhi browser extension must be installed and enabled
- Test app runs on port 12345 (required for integration tests)

## Architecture

- Uses @bodhiapp/bodhijs library for extension communication
- Only the library interacts with window.bodhiext
- React components handle UI state and user interactions
- Proper error handling for extension detection scenarios