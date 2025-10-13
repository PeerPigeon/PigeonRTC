import { BrowserRTCAdapter } from './BrowserRTCAdapter.js';
import { NodeRTCAdapter } from './NodeRTCAdapter.js';
import { SignalingClient } from './SignalingClient.js';
import { PeerConnection } from './PeerConnection.js';

/**
 * Main PigeonRTC class that provides a unified interface for WebRTC
 * across different environments with pluggable adapter support.
 */
export class PigeonRTC {
  constructor(options = {}) {
    this.adapter = options.adapter || null;
    this.initialized = false;
  }

  /**
   * Initialize PigeonRTC with automatic adapter detection or custom adapter
   * @param {Object} options - Configuration options
   * @param {RTCAdapter} options.adapter - Custom adapter to use (optional)
   * @param {boolean} options.preferNode - Prefer Node adapter even in browser (for testing)
   * @returns {Promise<void>}
   */
  async initialize(options = {}) {
    if (this.initialized) {
      return;
    }

    // Use custom adapter if provided
    if (options.adapter) {
      this.adapter = options.adapter;
    }

    // Auto-detect adapter if not provided
    if (!this.adapter) {
      this.adapter = await this._detectAdapter(options);
    }

    // Initialize the adapter
    await this.adapter.initialize();
    this.initialized = true;
  }

  /**
   * Automatically detect and create the appropriate adapter for the current environment
   * @private
   */
  async _detectAdapter(options = {}) {
    // Try Node adapter first if we're in Node.js and preferNode is true or no browser support
    if (options.preferNode || (typeof window === 'undefined' && typeof process !== 'undefined')) {
      const nodeAdapter = new NodeRTCAdapter();
      if (nodeAdapter.isSupported()) {
        try {
          await nodeAdapter.initialize();
          return nodeAdapter;
        } catch (error) {
          // If Node adapter fails, fall through to browser adapter (might be in a hybrid environment)
          console.warn('Node adapter initialization failed, trying browser adapter:', error.message);
        }
      }
    }

    // Try browser adapter
    const browserAdapter = new BrowserRTCAdapter();
    if (browserAdapter.isSupported()) {
      return browserAdapter;
    }

    // No supported adapter found
    throw new Error(
      'No supported WebRTC adapter found. ' +
      'Make sure you are running in a browser with WebRTC support or have @koush/wrtc installed for Node.js.'
    );
  }

  /**
   * Ensure PigeonRTC is initialized before use
   * @private
   */
  _ensureInitialized() {
    if (!this.initialized || !this.adapter) {
      throw new Error('PigeonRTC not initialized. Call initialize() first.');
    }
  }

  /**
   * Get the RTCPeerConnection class
   * @returns {typeof RTCPeerConnection}
   */
  getRTCPeerConnection() {
    this._ensureInitialized();
    return this.adapter.getRTCPeerConnection();
  }

  /**
   * Get the RTCSessionDescription class
   * @returns {typeof RTCSessionDescription}
   */
  getRTCSessionDescription() {
    this._ensureInitialized();
    return this.adapter.getRTCSessionDescription();
  }

  /**
   * Get the RTCIceCandidate class
   * @returns {typeof RTCIceCandidate}
   */
  getRTCIceCandidate() {
    this._ensureInitialized();
    return this.adapter.getRTCIceCandidate();
  }

  /**
   * Get the MediaStream class (if supported)
   * @returns {typeof MediaStream|null}
   */
  getMediaStream() {
    this._ensureInitialized();
    return this.adapter.getMediaStream();
  }

  /**
   * Create a new RTCPeerConnection with the given configuration
   * @param {RTCConfiguration} config - RTCPeerConnection configuration
   * @returns {RTCPeerConnection}
   */
  createPeerConnection(config) {
    this._ensureInitialized();
    const RTCPeerConnection = this.adapter.getRTCPeerConnection();
    return new RTCPeerConnection(config);
  }

  /**
   * Create a new RTCSessionDescription
   * @param {RTCSessionDescriptionInit} init - Session description initialization
   * @returns {RTCSessionDescription}
   */
  createSessionDescription(init) {
    this._ensureInitialized();
    const RTCSessionDescription = this.adapter.getRTCSessionDescription();
    return new RTCSessionDescription(init);
  }

  /**
   * Create a new RTCIceCandidate
   * @param {RTCIceCandidateInit} init - ICE candidate initialization
   * @returns {RTCIceCandidate}
   */
  createIceCandidate(init) {
    this._ensureInitialized();
    const RTCIceCandidate = this.adapter.getRTCIceCandidate();
    return new RTCIceCandidate(init);
  }

  /**
   * Get user media stream (camera/microphone)
   * @param {MediaStreamConstraints} constraints
   * @returns {Promise<MediaStream>}
   */
  async getUserMedia(constraints) {
    this._ensureInitialized();
    return await this.adapter.getUserMedia(constraints);
  }

  /**
   * Get display media stream (screen sharing)
   * @param {MediaStreamConstraints} constraints
   * @returns {Promise<MediaStream>}
   */
  async getDisplayMedia(constraints) {
    this._ensureInitialized();
    return await this.adapter.getDisplayMedia(constraints);
  }

  /**
   * Check if WebRTC is supported in the current environment
   * @returns {boolean}
   */
  isSupported() {
    return this.adapter ? this.adapter.isSupported() : false;
  }

  /**
   * Get the name of the current adapter
   * @returns {string}
   */
  getAdapterName() {
    return this.adapter ? this.adapter.getName() : 'None';
  }

  /**
   * Create a signaling client for peer discovery and connection management
   * @param {string} serverUrl - WebSocket server URL (e.g., 'ws://localhost:9090')
   * @returns {SignalingClient}
   */
  createSignalingClient(serverUrl) {
    return new SignalingClient(serverUrl);
  }

  /**
   * Create a managed peer connection with built-in signaling
   * @param {SignalingClient} signalingClient - Signaling client instance
   * @param {RTCConfiguration} config - RTCPeerConnection configuration
   * @returns {PeerConnection}
   */
  createManagedPeerConnection(signalingClient, config = {}) {
    this._ensureInitialized();
    return new PeerConnection(this, signalingClient, config);
  }
}

/**
 * Create and initialize a PigeonRTC instance
 * @param {Object} options - Configuration options
 * @returns {Promise<PigeonRTC>}
 */
export async function createPigeonRTC(options = {}) {
  const rtc = new PigeonRTC(options);
  await rtc.initialize(options);
  return rtc;
}

// Export additional classes
export { SignalingClient } from './SignalingClient.js';
export { PeerConnection } from './PeerConnection.js';
