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

  /**
   * Create a WebSocket-based signaling client
   */
  createSignalingClient(serverUrl: string): SignalingClient;

  /**
   * Create a managed peer connection with built-in signaling
   */
  createManagedPeerConnection(signalingClient: SignalingClient, config?: RTCConfiguration): PeerConnection;
}

/**
 * WebSocket-based signaling client with EventTarget interface
 */
export declare class SignalingClient extends EventTarget {
  constructor(serverUrl: string);
  
  /**
   * Connect to the signaling server
   */
  connect(): Promise<void>;
  
  /**
   * Disconnect from the signaling server
   */
  disconnect(): void;
  
  /**
   * Send a raw message to the signaling server
   */
  send(message: any): void;
  
  /**
   * Send an offer to a peer
   */
  sendOffer(peerId: string | number, offer: RTCSessionDescriptionInit): void;
  
  /**
   * Send an answer to a peer
   */
  sendAnswer(peerId: string | number, answer: RTCSessionDescriptionInit): void;
  
  /**
   * Send an ICE candidate to a peer
   */
  sendIceCandidate(peerId: string | number, candidate: RTCIceCandidateInit): void;
  
  /**
   * Check if connected to signaling server
   */
  isConnected(): boolean;
  
  /**
   * Get this client's ID
   */
  getClientId(): string | number | null;
  
  // Event types:
  // - 'connected': Fired when connected to server
  // - 'disconnected': Fired when disconnected from server
  // - 'error': Fired on error (event.detail contains error)
  // - 'id': Fired when client ID is assigned (event.detail.id)
  // - 'clients': Fired when client list updates (event.detail.clients)
  // - 'signal': Fired on incoming signaling message (event.detail contains full message)
}

/**
 * Managed peer connection with automatic signaling integration
 */
export declare class PeerConnection extends EventTarget {
  constructor(rtc: PigeonRTC, signalingClient: SignalingClient, config?: RTCConfiguration & { 
    enableMDNS?: boolean;
    mdnsServerUrl?: string; // URL for pigeonns HTTP server (default: 'http://localhost:5380')
  });
  
  /**
   * Initiate connection to a peer (creates and sends offer)
   */
  connect(peerId: string | number, localStream?: MediaStream): Promise<void>;
  
  /**
   * Handle incoming offer from a peer
   */
  handleOffer(peerId: string | number, offer: RTCSessionDescriptionInit, localStream?: MediaStream): Promise<void>;
  
  /**
   * Handle incoming answer from a peer
   */
  handleAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
  
  /**
   * Handle incoming ICE candidate from a peer
   */
  handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  
  /**
   * Create a data channel
   */
  createDataChannel(label: string, options?: RTCDataChannelInit): RTCDataChannel;
  
  /**
   * Get an existing data channel by label
   */
  getDataChannel(label: string): RTCDataChannel | undefined;
  
  /**
   * Send data on a channel
   */
  send(channelLabel: string, data: string | ArrayBuffer | Blob): void;
  
  /**
   * Get the underlying RTCPeerConnection
   */
  getRTCPeerConnection(): RTCPeerConnection;
  
  /**
   * Close the peer connection
   */
  close(): void;
  
  // Event types:
  // - 'connected': Fired when peer connection established
  // - 'failed': Fired when peer connection fails
  // - 'track': Fired when remote track received (event.detail.track and event.detail.streams)
  // - 'datachannel': Fired when remote data channel received (event.detail.channel)
  // - 'channelopen': Fired when data channel opens (event.detail.channel)
  // - 'message': Fired when data channel message received (event.detail = {channel, data})
  // - 'channelclose': Fired when data channel closes (event.detail.channel)
  // - 'connectionstatechange': Fired on connection state change (event.detail.state)
  // - 'iceconnectionstatechange': Fired on ICE connection state change (event.detail.state)
}

/**
 * mDNS Resolver for handling .local ICE candidates
 */
export declare class MDNSResolver {
  constructor(options?: {
    serverUrl?: string; // HTTP server URL for browser mode (default: 'http://localhost:5380')
  });
  
  /**
   * Initialize the mDNS resolver
   */
  initialize(): Promise<void>;
  
  /**
   * Check if the resolver is available and initialized
   */
  isAvailable(): boolean;
  
  /**
   * Check if an ICE candidate contains a .local hostname
   */
  isLocalCandidate(candidate: RTCIceCandidateInit): boolean;
  
  /**
   * Resolve a .local hostname to an IP address using mDNS
   */
  resolve(hostname: string): Promise<string | null>;
  
  /**
   * Resolve an ICE candidate that contains a .local hostname
   */
  resolveCandidate(candidate: RTCIceCandidateInit): Promise<RTCIceCandidateInit | null>;
  
  /**
   * Clear the resolution cache
   */
  clearCache(): void;
  
  /**
   * Dispose of the resolver and clean up resources
   */
  dispose(): void;
}

/**
 * Create and initialize a PigeonRTC instance
 */
export declare function createPigeonRTC(options?: PigeonRTCOptions): Promise<PigeonRTC>;

export default createPigeonRTC;
