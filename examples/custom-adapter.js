/**
 * Custom Adapter Example
 * 
 * This example shows how to create and use a custom RTCAdapter
 * for specialized WebRTC implementations.
 */

import { createPigeonRTC, RTCAdapter } from '../src/index.js';

/**
 * Example custom adapter that wraps the browser's WebRTC
 * but adds custom logging and modifications
 */
class LoggingRTCAdapter extends RTCAdapter {
  constructor() {
    super();
    this.logPrefix = '[LoggingAdapter]';
  }

  getRTCPeerConnection() {
    console.log(this.logPrefix, 'Getting RTCPeerConnection class');
    
    // In browser
    if (typeof window !== 'undefined') {
      return window.RTCPeerConnection;
    }
    
    throw new Error('Not in browser environment');
  }

  getRTCSessionDescription() {
    console.log(this.logPrefix, 'Getting RTCSessionDescription class');
    
    if (typeof window !== 'undefined') {
      return window.RTCSessionDescription;
    }
    
    throw new Error('Not in browser environment');
  }

  getRTCIceCandidate() {
    console.log(this.logPrefix, 'Getting RTCIceCandidate class');
    
    if (typeof window !== 'undefined') {
      return window.RTCIceCandidate;
    }
    
    throw new Error('Not in browser environment');
  }

  getMediaStream() {
    if (typeof window !== 'undefined') {
      return window.MediaStream;
    }
    return null;
  }

  isSupported() {
    const supported = typeof window !== 'undefined' && 
                     typeof window.RTCPeerConnection !== 'undefined';
    console.log(this.logPrefix, 'Is supported:', supported);
    return supported;
  }

  getName() {
    return 'LoggingRTCAdapter';
  }

  async initialize() {
    console.log(this.logPrefix, 'Initializing...');
    // Custom initialization logic here
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async init
    console.log(this.logPrefix, 'Initialized!');
  }

  async getUserMedia(constraints) {
    console.log(this.logPrefix, 'Getting user media with constraints:', constraints);
    
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      return await navigator.mediaDevices.getUserMedia(constraints);
    }
    
    throw new Error('getUserMedia not supported');
  }
}

async function main() {
  try {
    console.log('Creating PigeonRTC with custom adapter...');
    
    // Create custom adapter
    const customAdapter = new LoggingRTCAdapter();
    
    // Initialize PigeonRTC with the custom adapter
    const rtc = await createPigeonRTC({
      adapter: customAdapter
    });
    
    console.log('PigeonRTC initialized with adapter:', rtc.getAdapterName());
    
    // Now use PigeonRTC normally
    const pc = rtc.createPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    console.log('Peer connection created:', pc);
    
    // Clean up
    pc.close();
    console.log('Done!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run if this is the main module
if (typeof window === 'undefined') {
  main();
}

export { LoggingRTCAdapter, main as default };
