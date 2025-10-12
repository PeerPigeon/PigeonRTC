/**
 * Type definitions for PigeonRTC
 */

export interface RTCAdapterInterface {
  /**
   * Get the RTCPeerConnection class for this adapter
   */
  getRTCPeerConnection(): typeof RTCPeerConnection;

  /**
   * Get the RTCSessionDescription class for this adapter
   */
  getRTCSessionDescription(): typeof RTCSessionDescription;

  /**
   * Get the RTCIceCandidate class for this adapter
   */
  getRTCIceCandidate(): typeof RTCIceCandidate;

  /**
   * Get the MediaStream class for this adapter (if supported)
   */
  getMediaStream(): typeof MediaStream | null;

  /**
   * Check if this adapter supports the current environment
   */
  isSupported(): boolean;

  /**
   * Get the name of this adapter
   */
  getName(): string;

  /**
   * Initialize the adapter (for any setup that needs to happen)
   */
  initialize(): Promise<void>;

  /**
   * Get user media (if supported)
   */
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;

  /**
   * Get display media (if supported)
   */
  getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

export declare class RTCAdapter implements RTCAdapterInterface {
  getRTCPeerConnection(): typeof RTCPeerConnection;
  getRTCSessionDescription(): typeof RTCSessionDescription;
  getRTCIceCandidate(): typeof RTCIceCandidate;
  getMediaStream(): typeof MediaStream | null;
  isSupported(): boolean;
  getName(): string;
  initialize(): Promise<void>;
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
}

export declare class BrowserRTCAdapter extends RTCAdapter {
  constructor();
}

export declare class NodeRTCAdapter extends RTCAdapter {
  constructor();
}

export interface PigeonRTCOptions {
  /**
   * Custom adapter to use (optional)
   */
  adapter?: RTCAdapter;

  /**
   * Prefer Node adapter even in browser (for testing)
   */
  preferNode?: boolean;
}

export declare class PigeonRTC {
  constructor(options?: PigeonRTCOptions);

  /**
   * Initialize PigeonRTC with automatic adapter detection or custom adapter
   */
  initialize(options?: PigeonRTCOptions): Promise<void>;

  /**
   * Get the RTCPeerConnection class
   */
  getRTCPeerConnection(): typeof RTCPeerConnection;

  /**
   * Get the RTCSessionDescription class
   */
  getRTCSessionDescription(): typeof RTCSessionDescription;

  /**
   * Get the RTCIceCandidate class
   */
  getRTCIceCandidate(): typeof RTCIceCandidate;

  /**
   * Get the MediaStream class (if supported)
   */
  getMediaStream(): typeof MediaStream | null;

  /**
   * Create a new RTCPeerConnection with the given configuration
   */
  createPeerConnection(config?: RTCConfiguration): RTCPeerConnection;

  /**
   * Create a new RTCSessionDescription
   */
  createSessionDescription(init: RTCSessionDescriptionInit): RTCSessionDescription;

  /**
   * Create a new RTCIceCandidate
   */
  createIceCandidate(init: RTCIceCandidateInit): RTCIceCandidate;

  /**
   * Get user media stream (camera/microphone)
   */
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;

  /**
   * Get display media stream (screen sharing)
   */
  getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;

  /**
   * Check if WebRTC is supported in the current environment
   */
  isSupported(): boolean;

  /**
   * Get the name of the current adapter
   */
  getAdapterName(): string;
}

/**
 * Create and initialize a PigeonRTC instance
 */
export declare function createPigeonRTC(options?: PigeonRTCOptions): Promise<PigeonRTC>;

export default createPigeonRTC;
