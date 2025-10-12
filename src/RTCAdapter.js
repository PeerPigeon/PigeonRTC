/**
 * Base RTCAdapter interface that all WebRTC adapters must implement.
 * This provides a consistent API regardless of the underlying WebRTC implementation.
 */
export class RTCAdapter {
  /**
   * Get the RTCPeerConnection class for this adapter
   * @returns {typeof RTCPeerConnection} The RTCPeerConnection class
   */
  getRTCPeerConnection() {
    throw new Error('getRTCPeerConnection must be implemented by adapter');
  }

  /**
   * Get the RTCSessionDescription class for this adapter
   * @returns {typeof RTCSessionDescription} The RTCSessionDescription class
   */
  getRTCSessionDescription() {
    throw new Error('getRTCSessionDescription must be implemented by adapter');
  }

  /**
   * Get the RTCIceCandidate class for this adapter
   * @returns {typeof RTCIceCandidate} The RTCIceCandidate class
   */
  getRTCIceCandidate() {
    throw new Error('getRTCIceCandidate must be implemented by adapter');
  }

  /**
   * Get the MediaStream class for this adapter (if supported)
   * @returns {typeof MediaStream|null} The MediaStream class or null if not supported
   */
  getMediaStream() {
    return null;
  }

  /**
   * Check if this adapter supports the current environment
   * @returns {boolean} True if the adapter can work in the current environment
   */
  isSupported() {
    throw new Error('isSupported must be implemented by adapter');
  }

  /**
   * Get the name of this adapter
   * @returns {string} The adapter name
   */
  getName() {
    throw new Error('getName must be implemented by adapter');
  }

  /**
   * Initialize the adapter (for any setup that needs to happen)
   * @returns {Promise<void>}
   */
  async initialize() {
    // Default implementation does nothing
  }

  /**
   * Get user media (if supported)
   * @param {MediaStreamConstraints} _constraints
   * @returns {Promise<MediaStream>}
   */
  async getUserMedia(_constraints) {
    throw new Error('getUserMedia not supported by this adapter');
  }

  /**
   * Get display media (if supported)
   * @param {MediaStreamConstraints} _constraints
   * @returns {Promise<MediaStream>}
   */
  async getDisplayMedia(_constraints) {
    throw new Error('getDisplayMedia not supported by this adapter');
  }
}
