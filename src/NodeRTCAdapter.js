import { RTCAdapter } from './RTCAdapter.js';

/**
 * Node.js WebRTC adapter using @koush/wrtc package.
 * This adapter provides WebRTC functionality in Node.js environments.
 */
export class NodeRTCAdapter extends RTCAdapter {
  constructor() {
    super();
    this._wrtc = null;
    this._initialized = false;
  }

  async initialize() {
    if (this._initialized) {
      return;
    }

    try {
      // Dynamically import @koush/wrtc (it's an optional peer dependency)
      const wrtcModule = await import('@koush/wrtc');
      // Handle both default export (ES modules) and named exports (CommonJS)
      this._wrtc = wrtcModule.default || wrtcModule;
      this._initialized = true;
    } catch (error) {
      throw new Error(
        'NodeRTCAdapter requires @koush/wrtc to be installed. ' +
        'Install it with: npm install @koush/wrtc'
      );
    }
  }

  _ensureInitialized() {
    if (!this._initialized || !this._wrtc) {
      throw new Error(
        'NodeRTCAdapter not initialized. Call initialize() first.'
      );
    }
  }

  getRTCPeerConnection() {
    this._ensureInitialized();
    return this._wrtc.RTCPeerConnection;
  }

  getRTCSessionDescription() {
    this._ensureInitialized();
    return this._wrtc.RTCSessionDescription;
  }

  getRTCIceCandidate() {
    this._ensureInitialized();
    return this._wrtc.RTCIceCandidate;
  }

  getMediaStream() {
    this._ensureInitialized();
    return this._wrtc.MediaStream || null;
  }

  isSupported() {
    // Check if we're in a Node.js environment (not browser)
    return typeof process !== 'undefined' &&
           process.versions != null &&
           process.versions.node != null &&
           typeof window === 'undefined';
  }

  getName() {
    return 'NodeRTCAdapter';
  }

  async getUserMedia(_constraints) {
    // Node.js doesn't typically support getUserMedia
    // This would require additional hardware access libraries
    throw new Error('getUserMedia is not supported in Node.js environment');
  }

  async getDisplayMedia(_constraints) {
    // Node.js doesn't support getDisplayMedia
    throw new Error('getDisplayMedia is not supported in Node.js environment');
  }
}
