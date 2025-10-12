/* PigeonRTC Browser Bundle */
var PigeonRTC = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
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
    NodeRTCAdapter: () => NodeRTCAdapter,
    PigeonRTC: () => PigeonRTC,
    RTCAdapter: () => RTCAdapter,
    createPigeonRTC: () => createPigeonRTC,
    default: () => index_default
  });

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
        const wrtc = await import("@koush/wrtc");
        this._wrtc = wrtc;
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
  };
  async function createPigeonRTC(options = {}) {
    const rtc = new PigeonRTC(options);
    await rtc.initialize(options);
    return rtc;
  }

  // src/index.js
  var index_default = createPigeonRTC;
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=browser.js.map
