/**
 * Managed peer connection with built-in signaling support
 */
export class PeerConnection extends EventTarget {
  constructor(rtcInstance, signalingClient, config = {}) {
    super();
    this.rtc = rtcInstance;
    this.signaling = signalingClient;
    this.config = config;
    this.pc = null;
    this.dataChannels = new Map();
    this.remoteId = null;
    this.isInitiator = false;
  }

  /**
   * Initialize peer connection
   * @private
   */
  _init() {
    this.pc = this.rtc.createPeerConnection(this.config);
    
    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.remoteId) {
        this.signaling.sendIceCandidate(this.remoteId, event.candidate);
      }
    };
    
    // Handle connection state changes
    this.pc.onconnectionstatechange = () => {
      this.dispatchEvent(new CustomEvent('connectionstatechange', {
        detail: this.pc.connectionState
      }));
      
      if (this.pc.connectionState === 'connected') {
        this.dispatchEvent(new CustomEvent('connected'));
      } else if (this.pc.connectionState === 'failed') {
        this.dispatchEvent(new CustomEvent('failed'));
      }
    };
    
    // Handle ICE connection state changes
    this.pc.oniceconnectionstatechange = () => {
      this.dispatchEvent(new CustomEvent('iceconnectionstatechange', {
        detail: this.pc.iceConnectionState
      }));
    };
    
    // Handle remote tracks
    this.pc.ontrack = (event) => {
      this.dispatchEvent(new CustomEvent('track', {
        detail: { track: event.track, streams: event.streams }
      }));
    };
    
    // Handle incoming data channels
    this.pc.ondatachannel = (event) => {
      const channel = event.channel;
      this.dataChannels.set(channel.label, channel);
      this._setupDataChannel(channel);
      
      this.dispatchEvent(new CustomEvent('datachannel', {
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
    this._init();
    
    // Add local tracks if provided
    if (localStream) {
      localStream.getTracks().forEach(track => {
        this.pc.addTrack(track, localStream);
      });
    }
    
    // Create and send offer
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
    this._init();
    
    // Add local tracks if provided
    if (localStream) {
      localStream.getTracks().forEach(track => {
        this.pc.addTrack(track, localStream);
      });
    }
    
    // Set remote description and create answer
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
      await this.pc.addIceCandidate(candidate);
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
      throw new Error('Peer connection not initialized');
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
      this.dispatchEvent(new CustomEvent('channelopen', {
        detail: channel
      }));
    };
    
    channel.onmessage = (event) => {
      this.dispatchEvent(new CustomEvent('message', {
        detail: { channel: channel.label, data: event.data }
      }));
    };
    
    channel.onclose = () => {
      this.dataChannels.delete(channel.label);
      this.dispatchEvent(new CustomEvent('channelclose', {
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
    if (channel && channel.readyState === 'open') {
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
  }
}
