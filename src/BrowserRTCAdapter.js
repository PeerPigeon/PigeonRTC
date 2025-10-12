import { RTCAdapter } from './RTCAdapter.js';

/**
 * Browser-native WebRTC adapter for use in web browsers.
 * This adapter uses the browser's native WebRTC implementation.
 */
export class BrowserRTCAdapter extends RTCAdapter {
  constructor() {
    super();
    this._checkSupport();
  }

  _checkSupport() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // Browser environment - check for WebRTC support
    this.hasRTCPeerConnection = !!(
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection
    );

    this.hasGetUserMedia = !!(
      navigator.mediaDevices?.getUserMedia ||
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    );

    this.hasGetDisplayMedia = !!(
      navigator.mediaDevices?.getDisplayMedia
    );
  }

  getRTCPeerConnection() {
    if (typeof window === 'undefined') {
      throw new Error('BrowserRTCAdapter requires a browser environment');
    }

    return window.RTCPeerConnection ||
           window.webkitRTCPeerConnection ||
           window.mozRTCPeerConnection;
  }

  getRTCSessionDescription() {
    if (typeof window === 'undefined') {
      throw new Error('BrowserRTCAdapter requires a browser environment');
    }

    return window.RTCSessionDescription ||
           window.mozRTCSessionDescription;
  }

  getRTCIceCandidate() {
    if (typeof window === 'undefined') {
      throw new Error('BrowserRTCAdapter requires a browser environment');
    }

    return window.RTCIceCandidate ||
           window.mozRTCIceCandidate;
  }

  getMediaStream() {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.MediaStream || window.webkitMediaStream;
  }

  isSupported() {
    return typeof window !== 'undefined' && this.hasRTCPeerConnection;
  }

  getName() {
    return 'BrowserRTCAdapter';
  }

  async getUserMedia(constraints) {
    if (typeof navigator === 'undefined') {
      throw new Error('getUserMedia requires a browser environment');
    }

    // Modern API
    if (navigator.mediaDevices?.getUserMedia) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    }

    // Legacy API with Promise wrapper
    const getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia;

    if (!getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }

  async getDisplayMedia(constraints) {
    if (typeof navigator === 'undefined') {
      throw new Error('getDisplayMedia requires a browser environment');
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('getDisplayMedia is not supported in this browser');
    }

    return await navigator.mediaDevices.getDisplayMedia(constraints);
  }
}
