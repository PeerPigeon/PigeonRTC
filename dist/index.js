var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  BrowserRTCAdapter: () => BrowserRTCAdapter,
  MDNSResolver: () => MDNSResolver,
  NodeRTCAdapter: () => NodeRTCAdapter,
  PeerConnection: () => PeerConnection,
  PigeonRTC: () => PigeonRTC,
  RTCAdapter: () => RTCAdapter,
  SignalingClient: () => SignalingClient,
  createPigeonRTC: () => createPigeonRTC,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/RTCAdapter.js
var RTCAdapter = class {
  /**
   * Get the RTCPeerConnection class for this adapter
   * @returns {typeof RTCPeerConnection} The RTCPeerConnection class
   */
  getRTCPeerConnection() {
    throw new Error("getRTCPeerConnection must be implemented by adapter");
  }
  /**
   * Get the RTCSessionDescription class for this adapter
   * @returns {typeof RTCSessionDescription} The RTCSessionDescription class
   */
  getRTCSessionDescription() {
    throw new Error("getRTCSessionDescription must be implemented by adapter");
  }
  /**
   * Get the RTCIceCandidate class for this adapter
   * @returns {typeof RTCIceCandidate} The RTCIceCandidate class
   */
  getRTCIceCandidate() {
    throw new Error("getRTCIceCandidate must be implemented by adapter");
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
    throw new Error("isSupported must be implemented by adapter");
  }
  /**
   * Get the name of this adapter
   * @returns {string} The adapter name
   */
  getName() {
    throw new Error("getName must be implemented by adapter");
  }
  /**
   * Initialize the adapter (for any setup that needs to happen)
   * @returns {Promise<void>}
   */
  async initialize() {
  }
  /**
   * Get user media (if supported)
   * @param {MediaStreamConstraints} _constraints
   * @returns {Promise<MediaStream>}
   */
  async getUserMedia(_constraints) {
    throw new Error("getUserMedia not supported by this adapter");
  }
  /**
   * Get display media (if supported)
   * @param {MediaStreamConstraints} _constraints
   * @returns {Promise<MediaStream>}
   */
  async getDisplayMedia(_constraints) {
    throw new Error("getDisplayMedia not supported by this adapter");
  }
};

// src/BrowserRTCAdapter.js
var BrowserRTCAdapter = class extends RTCAdapter {
  constructor() {
    super();
    this._checkSupport();
  }
  _checkSupport() {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }
    this.hasRTCPeerConnection = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
    this.hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);
    this.hasGetDisplayMedia = !!navigator.mediaDevices?.getDisplayMedia;
  }
  getRTCPeerConnection() {
    if (typeof window === "undefined") {
      throw new Error("BrowserRTCAdapter requires a browser environment");
    }
    return window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  }
  getRTCSessionDescription() {
    if (typeof window === "undefined") {
      throw new Error("BrowserRTCAdapter requires a browser environment");
    }
    return window.RTCSessionDescription || window.mozRTCSessionDescription;
  }
  getRTCIceCandidate() {
    if (typeof window === "undefined") {
      throw new Error("BrowserRTCAdapter requires a browser environment");
    }
    return window.RTCIceCandidate || window.mozRTCIceCandidate;
  }
  getMediaStream() {
    if (typeof window === "undefined") {
      return null;
    }
    return window.MediaStream || window.webkitMediaStream;
  }
  isSupported() {
    return typeof window !== "undefined" && this.hasRTCPeerConnection;
  }
  getName() {
    return "BrowserRTCAdapter";
  }
  async getUserMedia(constraints) {
    if (typeof navigator === "undefined") {
      throw new Error("getUserMedia requires a browser environment");
    }
    if (navigator.mediaDevices?.getUserMedia) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    }
    const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!getUserMedia) {
      throw new Error("getUserMedia is not supported in this browser");
    }
    return new Promise((resolve, reject) => {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
  async getDisplayMedia(constraints) {
    if (typeof navigator === "undefined") {
      throw new Error("getDisplayMedia requires a browser environment");
    }
    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error("getDisplayMedia is not supported in this browser");
    }
    return await navigator.mediaDevices.getDisplayMedia(constraints);
  }
};

// src/NodeRTCAdapter.js
var NodeRTCAdapter = class extends RTCAdapter {
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
      const wrtcModule = await import("@koush/wrtc");
      this._wrtc = wrtcModule.default || wrtcModule;
      this._initialized = true;
    } catch (error) {
      throw new Error(
        "NodeRTCAdapter requires @koush/wrtc to be installed. Install it with: npm install @koush/wrtc"
      );
    }
  }
  _ensureInitialized() {
    if (!this._initialized || !this._wrtc) {
      throw new Error(
        "NodeRTCAdapter not initialized. Call initialize() first."
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
    return typeof process !== "undefined" && process.versions != null && process.versions.node != null && typeof window === "undefined";
  }
  getName() {
    return "NodeRTCAdapter";
  }
  async getUserMedia(_constraints) {
    throw new Error("getUserMedia is not supported in Node.js environment");
  }
  async getDisplayMedia(_constraints) {
    throw new Error("getDisplayMedia is not supported in Node.js environment");
  }
};

// src/SignalingClient.js
var SignalingClient = class extends EventTarget {
  constructor(serverUrl) {
    super();
    this.serverUrl = serverUrl;
    this.ws = null;
    this.clientId = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1e3;
  }
  /**
   * Connect to the signaling server
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);
        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.dispatchEvent(new CustomEvent("connected"));
          resolve();
        };
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (err) {
            console.error("Error parsing message:", err);
          }
        };
        this.ws.onerror = (error) => {
          this.dispatchEvent(new CustomEvent("error", { detail: error }));
          reject(error);
        };
        this.ws.onclose = () => {
          this.connected = false;
          this.dispatchEvent(new CustomEvent("disconnected"));
          this.attemptReconnect();
        };
      } catch (err) {
        reject(err);
      }
    });
  }
  /**
   * Handle incoming messages from signaling server
   * @private
   */
  handleMessage(message) {
    switch (message.type) {
      case "id":
        this.clientId = message.id;
        this.dispatchEvent(new CustomEvent("id", { detail: { id: message.id } }));
        break;
      case "clients":
        this.dispatchEvent(new CustomEvent("clients", { detail: { clients: message.clients } }));
        break;
      case "offer":
      case "answer":
      case "ice-candidate":
        this.dispatchEvent(new CustomEvent("signal", { detail: message }));
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  }
  /**
   * Send a message to the signaling server
   * @param {Object} message - Message to send
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error("WebSocket not connected");
    }
  }
  /**
   * Send an offer to a peer
   * @param {string|number} peerId - Target peer ID
   * @param {RTCSessionDescriptionInit} offer - WebRTC offer
   */
  sendOffer(peerId, offer) {
    this.send({
      type: "offer",
      to: peerId,
      offer
    });
  }
  /**
   * Send an answer to a peer
   * @param {string|number} peerId - Target peer ID
   * @param {RTCSessionDescriptionInit} answer - WebRTC answer
   */
  sendAnswer(peerId, answer) {
    this.send({
      type: "answer",
      to: peerId,
      answer
    });
  }
  /**
   * Send an ICE candidate to a peer
   * @param {string|number} peerId - Target peer ID
   * @param {RTCIceCandidateInit} candidate - ICE candidate
   */
  sendIceCandidate(peerId, candidate) {
    this.send({
      type: "ice-candidate",
      to: peerId,
      candidate
    });
  }
  /**
   * Attempt to reconnect to the signaling server
   * @private
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
        this.connect().catch((err) => {
          console.error("Reconnect failed:", err);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
  /**
   * Disconnect from the signaling server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.clientId = null;
    }
  }
  /**
   * Check if connected to signaling server
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
  /**
   * Get client ID
   * @returns {string|number|null}
   */
  getClientId() {
    return this.clientId;
  }
};

// src/MDNSResolver.js
var MDNSResolver = class {
  constructor() {
    this._resolver = null;
    this._initialized = false;
    this._cache = /* @__PURE__ */ new Map();
    this._cacheTimeout = 6e4;
  }
  /**
   * Initialize the mDNS resolver
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) {
      return;
    }
    try {
      const pigeonnsModule = await import("pigeonns");
      this._resolver = pigeonnsModule.default || pigeonnsModule;
      this._initialized = true;
    } catch (error) {
      console.warn("Failed to initialize mDNS resolver:", error.message);
      this._initialized = false;
    }
  }
  /**
   * Check if the resolver is available and initialized
   * @returns {boolean}
   */
  isAvailable() {
    return this._initialized && this._resolver !== null;
  }
  /**
   * Check if an ICE candidate contains a .local hostname
   * @param {RTCIceCandidateInit} candidate - ICE candidate to check
   * @returns {boolean}
   */
  isLocalCandidate(candidate) {
    if (!candidate || !candidate.candidate) {
      return false;
    }
    return candidate.candidate.includes(".local");
  }
  /**
   * Extract hostname from ICE candidate string
   * @param {string} candidateString - ICE candidate string
   * @returns {string|null} - Extracted hostname or null
   * @private
   */
  _extractHostname(candidateString) {
    const parts = candidateString.split(" ");
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].endsWith(".local")) {
        return parts[i];
      }
    }
    return null;
  }
  /**
   * Get cached IP address for hostname
   * @param {string} hostname - Hostname to lookup
   * @returns {string|null}
   * @private
   */
  _getCachedIP(hostname) {
    const cached = this._cache.get(hostname);
    if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
      return cached.ip;
    }
    return null;
  }
  /**
   * Set cached IP address for hostname
   * @param {string} hostname - Hostname to cache
   * @param {string} ip - IP address to cache
   * @private
   */
  _setCachedIP(hostname, ip) {
    this._cache.set(hostname, {
      ip,
      timestamp: Date.now()
    });
  }
  /**
   * Resolve a .local hostname to an IP address using mDNS
   * @param {string} hostname - Hostname to resolve (e.g., "myhost.local")
   * @returns {Promise<string|null>} - Resolved IP address or null if resolution fails
   */
  async resolve(hostname) {
    if (!this.isAvailable()) {
      console.warn("mDNS resolver not available");
      return null;
    }
    const cachedIP = this._getCachedIP(hostname);
    if (cachedIP) {
      return cachedIP;
    }
    try {
      const ip = await this._resolver.resolve(hostname);
      if (ip) {
        this._setCachedIP(hostname, ip);
        return ip;
      }
      return null;
    } catch (error) {
      console.warn(`Failed to resolve ${hostname}:`, error.message);
      return null;
    }
  }
  /**
   * Resolve an ICE candidate that contains a .local hostname
   * Returns a new candidate with the hostname replaced by the IP address
   * @param {RTCIceCandidateInit} candidate - ICE candidate to resolve
   * @returns {Promise<RTCIceCandidateInit|null>} - Resolved candidate or null
   */
  async resolveCandidate(candidate) {
    if (!candidate || !candidate.candidate) {
      return null;
    }
    if (!this.isLocalCandidate(candidate)) {
      return candidate;
    }
    const hostname = this._extractHostname(candidate.candidate);
    if (!hostname) {
      console.warn("Could not extract hostname from candidate:", candidate.candidate);
      return null;
    }
    const ip = await this.resolve(hostname);
    if (!ip) {
      console.warn(`Could not resolve ${hostname} to IP address`);
      return null;
    }
    const resolvedCandidateString = candidate.candidate.replace(hostname, ip);
    return {
      ...candidate,
      candidate: resolvedCandidateString,
      address: ip
    };
  }
  /**
   * Clear the resolution cache
   */
  clearCache() {
    this._cache.clear();
  }
  /**
   * Dispose of the resolver and clean up resources
   */
  dispose() {
    this.clearCache();
    this._resolver = null;
    this._initialized = false;
  }
};

// src/PeerConnection.js
var PeerConnection = class extends EventTarget {
  constructor(rtcInstance, signalingClient, config = {}) {
    super();
    this.rtc = rtcInstance;
    this.signaling = signalingClient;
    this.config = config;
    this.pc = null;
    this.dataChannels = /* @__PURE__ */ new Map();
    this.remoteId = null;
    this.isInitiator = false;
    this.mdnsResolver = new MDNSResolver();
    this._mdnsEnabled = config.enableMDNS !== false;
  }
  /**
   * Initialize peer connection
   * @private
   */
  async _init() {
    if (this._mdnsEnabled) {
      await this.mdnsResolver.initialize();
    }
    this.pc = this.rtc.createPeerConnection(this.config);
    this.pc.onicecandidate = async (event) => {
      if (event.candidate && this.remoteId) {
        let candidateToSend = event.candidate;
        if (this._mdnsEnabled && this.mdnsResolver.isAvailable() && this.mdnsResolver.isLocalCandidate(event.candidate)) {
          const resolvedCandidate = await this.mdnsResolver.resolveCandidate(event.candidate);
          if (resolvedCandidate) {
            candidateToSend = resolvedCandidate;
            console.log("Resolved .local ICE candidate:", event.candidate.candidate, "->", resolvedCandidate.candidate);
          }
        }
        this.signaling.sendIceCandidate(this.remoteId, candidateToSend);
      }
    };
    this.pc.onconnectionstatechange = () => {
      this.dispatchEvent(new CustomEvent("connectionstatechange", {
        detail: this.pc.connectionState
      }));
      if (this.pc.connectionState === "connected") {
        this.dispatchEvent(new CustomEvent("connected"));
      } else if (this.pc.connectionState === "failed") {
        this.dispatchEvent(new CustomEvent("failed"));
      }
    };
    this.pc.oniceconnectionstatechange = () => {
      this.dispatchEvent(new CustomEvent("iceconnectionstatechange", {
        detail: this.pc.iceConnectionState
      }));
    };
    this.pc.ontrack = (event) => {
      this.dispatchEvent(new CustomEvent("track", {
        detail: { track: event.track, streams: event.streams }
      }));
    };
    this.pc.ondatachannel = (event) => {
      const channel = event.channel;
      this.dataChannels.set(channel.label, channel);
      this._setupDataChannel(channel);
      this.dispatchEvent(new CustomEvent("datachannel", {
        detail: channel
      }));
    };
  }
  /**
   * Connect to a remote peer
   * @param {string|number} peerId - Remote peer ID
   * @param {MediaStream} [localStream] - Optional local media stream
   * @returns {Promise<void>}
   */
  async connect(peerId, localStream = null) {
    this.remoteId = peerId;
    this.isInitiator = true;
    await this._init();
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, localStream);
      });
    }
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.signaling.sendOffer(peerId, offer);
  }
  /**
   * Handle incoming offer from remote peer
   * @param {string|number} peerId - Remote peer ID
   * @param {RTCSessionDescriptionInit} offer - WebRTC offer
   * @param {MediaStream} [localStream] - Optional local media stream
   * @returns {Promise<void>}
   */
  async handleOffer(peerId, offer, localStream = null) {
    this.remoteId = peerId;
    this.isInitiator = false;
    await this._init();
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, localStream);
      });
    }
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.signaling.sendAnswer(peerId, answer);
  }
  /**
   * Handle incoming answer from remote peer
   * @param {RTCSessionDescriptionInit} answer - WebRTC answer
   * @returns {Promise<void>}
   */
  async handleAnswer(answer) {
    await this.pc.setRemoteDescription(answer);
  }
  /**
   * Handle incoming ICE candidate
   * @param {RTCIceCandidateInit} candidate - ICE candidate
   * @returns {Promise<void>}
   */
  async handleIceCandidate(candidate) {
    if (this.pc) {
      let candidateToAdd = candidate;
      if (this._mdnsEnabled && this.mdnsResolver.isAvailable() && this.mdnsResolver.isLocalCandidate(candidate)) {
        const resolvedCandidate = await this.mdnsResolver.resolveCandidate(candidate);
        if (resolvedCandidate) {
          candidateToAdd = resolvedCandidate;
          console.log("Resolved incoming .local ICE candidate:", candidate.candidate, "->", resolvedCandidate.candidate);
        }
      }
      await this.pc.addIceCandidate(candidateToAdd);
    }
  }
  /**
   * Create a data channel
   * @param {string} label - Channel label
   * @param {RTCDataChannelInit} [options] - Data channel options
   * @returns {RTCDataChannel}
   */
  createDataChannel(label, options = {}) {
    if (!this.pc) {
      throw new Error("Peer connection not initialized");
    }
    const channel = this.pc.createDataChannel(label, options);
    this.dataChannels.set(label, channel);
    this._setupDataChannel(channel);
    return channel;
  }
  /**
   * Setup data channel event handlers
   * @private
   */
  _setupDataChannel(channel) {
    channel.onopen = () => {
      this.dispatchEvent(new CustomEvent("channelopen", {
        detail: channel
      }));
    };
    channel.onmessage = (event) => {
      this.dispatchEvent(new CustomEvent("message", {
        detail: { channel: channel.label, data: event.data }
      }));
    };
    channel.onclose = () => {
      this.dataChannels.delete(channel.label);
      this.dispatchEvent(new CustomEvent("channelclose", {
        detail: channel
      }));
    };
  }
  /**
   * Send data on a channel
   * @param {string} channelLabel - Channel label
   * @param {string|ArrayBuffer|Blob} data - Data to send
   */
  send(channelLabel, data) {
    const channel = this.dataChannels.get(channelLabel);
    if (channel && channel.readyState === "open") {
      channel.send(data);
    } else {
      throw new Error(`Channel ${channelLabel} not open`);
    }
  }
  /**
   * Get a data channel by label
   * @param {string} label - Channel label
   * @returns {RTCDataChannel|undefined}
   */
  getDataChannel(label) {
    return this.dataChannels.get(label);
  }
  /**
   * Get the underlying RTCPeerConnection
   * @returns {RTCPeerConnection}
   */
  getRTCPeerConnection() {
    return this.pc;
  }
  /**
   * Close the peer connection
   */
  close() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.dataChannels.clear();
    this.remoteId = null;
    if (this.mdnsResolver) {
      this.mdnsResolver.dispose();
    }
  }
};

// src/PigeonRTC.js
var PigeonRTC = class {
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
    if (options.adapter) {
      this.adapter = options.adapter;
    }
    if (!this.adapter) {
      this.adapter = await this._detectAdapter(options);
    }
    await this.adapter.initialize();
    this.initialized = true;
  }
  /**
   * Automatically detect and create the appropriate adapter for the current environment
   * @private
   */
  async _detectAdapter(options = {}) {
    if (options.preferNode || typeof window === "undefined" && typeof process !== "undefined") {
      const nodeAdapter = new NodeRTCAdapter();
      if (nodeAdapter.isSupported()) {
        try {
          await nodeAdapter.initialize();
          return nodeAdapter;
        } catch (error) {
          console.warn("Node adapter initialization failed, trying browser adapter:", error.message);
        }
      }
    }
    const browserAdapter = new BrowserRTCAdapter();
    if (browserAdapter.isSupported()) {
      return browserAdapter;
    }
    throw new Error(
      "No supported WebRTC adapter found. Make sure you are running in a browser with WebRTC support or have @koush/wrtc installed for Node.js."
    );
  }
  /**
   * Ensure PigeonRTC is initialized before use
   * @private
   */
  _ensureInitialized() {
    if (!this.initialized || !this.adapter) {
      throw new Error("PigeonRTC not initialized. Call initialize() first.");
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
    return this.adapter ? this.adapter.getName() : "None";
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
};
async function createPigeonRTC(options = {}) {
  const rtc = new PigeonRTC(options);
  await rtc.initialize(options);
  return rtc;
}

// src/index.js
var index_default = createPigeonRTC;
//# sourceMappingURL=index.js.map
