/**
 * WebSocket signaling client for PigeonRTC
 * Handles peer discovery and WebRTC signaling over WebSocket
 */
export class SignalingClient extends EventTarget {
  constructor(serverUrl) {
    super();
    this.serverUrl = serverUrl;
    this.ws = null;
    this.clientId = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
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
          this.dispatchEvent(new CustomEvent('connected'));
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (err) {
            console.error('Error parsing message:', err);
          }
        };
        
        this.ws.onerror = (error) => {
          this.dispatchEvent(new CustomEvent('error', { detail: error }));
          reject(error);
        };
        
        this.ws.onclose = () => {
          this.connected = false;
          this.dispatchEvent(new CustomEvent('disconnected'));
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
    case 'id':
      this.clientId = message.id;
      this.dispatchEvent(new CustomEvent('id', { detail: { id: message.id } }));
      break;
        
    case 'clients':
      this.dispatchEvent(new CustomEvent('clients', { detail: { clients: message.clients } }));
      break;
        
    case 'offer':
    case 'answer':
    case 'ice-candidate':
      this.dispatchEvent(new CustomEvent('signal', { detail: message }));
      break;
        
    default:
      console.warn('Unknown message type:', message.type);
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
      throw new Error('WebSocket not connected');
    }
  }

  /**
   * Send an offer to a peer
   * @param {string|number} peerId - Target peer ID
   * @param {RTCSessionDescriptionInit} offer - WebRTC offer
   */
  sendOffer(peerId, offer) {
    this.send({
      type: 'offer',
      to: peerId,
      offer: offer
    });
  }

  /**
   * Send an answer to a peer
   * @param {string|number} peerId - Target peer ID
   * @param {RTCSessionDescriptionInit} answer - WebRTC answer
   */
  sendAnswer(peerId, answer) {
    this.send({
      type: 'answer',
      to: peerId,
      answer: answer
    });
  }

  /**
   * Send an ICE candidate to a peer
   * @param {string|number} peerId - Target peer ID
   * @param {RTCIceCandidateInit} candidate - ICE candidate
   */
  sendIceCandidate(peerId, candidate) {
    this.send({
      type: 'ice-candidate',
      to: peerId,
      candidate: candidate
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
        this.connect().catch(err => {
          console.error('Reconnect failed:', err);
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
}
