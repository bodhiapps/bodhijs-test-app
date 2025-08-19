// Browser and OS type definitions
export type BrowserType = 'chrome' | 'edge' | 'firefox' | 'safari' | 'unknown';
export type OSType = 'macos' | 'windows' | 'linux' | 'unknown';

// Error code constants
export type ServerErrorCode = 'server-pending-ext-ready' | 'server-conn-refused' | 'server-conn-timeout' | 'server-not-found' | 'server-network-unreachable' | 'server-service-unavailable' | 'server-unexpected-error' | 'server-in-setup-status' | 'server-in-admin-status';
export type ExtensionErrorCode = 'ext-not-installed' | 'ext-connection-failed' | 'ext-unsupported-version';

// Server error code constants
export const SERVER_PENDING_EXT_READY: ServerErrorCode = 'server-pending-ext-ready';
export const SERVER_CONN_REFUSED: ServerErrorCode = 'server-conn-refused';
export const SERVER_CONN_TIMEOUT: ServerErrorCode = 'server-conn-timeout';
export const SERVER_NOT_FOUND: ServerErrorCode = 'server-not-found';
export const SERVER_NETWORK_UNREACHABLE: ServerErrorCode = 'server-network-unreachable';
export const SERVER_SERVICE_UNAVAILABLE: ServerErrorCode = 'server-service-unavailable';
export const SERVER_UNEXPECTED_ERROR: ServerErrorCode = 'server-unexpected-error';
export const SERVER_IN_SETUP_STATUS: ServerErrorCode = 'server-in-setup-status';
export const SERVER_IN_ADMIN_STATUS: ServerErrorCode = 'server-in-admin-status';

// Extension error code constants
export const EXT_NOT_INSTALLED: ExtensionErrorCode = 'ext-not-installed';
export const EXT_CONNECTION_FAILED: ExtensionErrorCode = 'ext-connection-failed';
export const EXT_UNSUPPORTED_VERSION: ExtensionErrorCode = 'ext-unsupported-version';

// Extension state interfaces
export interface ExtensionStateReady {
  /** Current extension status */
  status: 'ready';
  /** Extension version */
  version: string;
  /** Extension ID (always present when ready) */
  id: string;
}

export interface ExtensionStateNotReady {
  /** Current extension status */
  status: 'unreachable' | 'not-installed' | 'unsupported';
  /** Error details */
  error: {
    /** Error message */
    message: string;
    /** Error code */
    code: ExtensionErrorCode;
  };
}

export type ExtensionState = ExtensionStateReady | ExtensionStateNotReady;

// Server state interfaces
export interface ServerStateReady {
  /** Current server status */
  status: 'ready';
  /** Server version */
  version: string;
}

export interface ServerStateReachable {
  /** Current server status */
  status: 'setup' | 'resource-admin';
  /** Server version */
  version: string;
  /** Error details */
  error: {
    /** Error message */
    message: string;
    /** Error code */
    code: ServerErrorCode;
  };
}

export interface ServerStatePending {
  /** Current server status */
  status: 'pending-extension-ready';
  /** Error details */
  error: {
    /** Error message */
    message: string;
    /** Error code */
    code: ServerErrorCode;
  };
}

export interface ServerStateUnreachable {
  /** Current server status */
  status: 'unreachable';
  /** Error details */
  error: {
    /** Error message */
    message: string;
    /** Error code */
    code: ServerErrorCode;
  };
}

export interface ServerStateError {
  /** Current server status */
  status: 'error';
  /** Error details */
  error: {
    /** Error message */
    message: string;
    /** Error code */
    code: ServerErrorCode;
  };
}

export type ServerState = ServerStateReady | ServerStateReachable | ServerStatePending | ServerStateUnreachable | ServerStateError;

// Internal platform state interface for test app
export interface InternalPlatformState {
  /** Extension state details */
  extension: ExtensionState;
  /** Server state details */
  server: ServerState;
}

// Simplified types for test app simulation
export interface SimulationState {
  browser: BrowserType;
  os: OSType;
  extension: ExtensionState;
  server: ServerState;
}
