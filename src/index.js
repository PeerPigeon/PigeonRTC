/**
 * PigeonRTC - Pluggable cross-browser compatible WebRTC library
 * 
 * A lightweight, pluggable WebRTC library that provides a consistent API
 * across different environments (browser and Node.js) with support for
 * custom adapters.
 * 
 * @module pigeonrtc
 */

export { PigeonRTC, createPigeonRTC, SignalingClient, PeerConnection } from './PigeonRTC.js';
export { RTCAdapter } from './RTCAdapter.js';
export { BrowserRTCAdapter } from './BrowserRTCAdapter.js';
export { NodeRTCAdapter } from './NodeRTCAdapter.js';

// Default export for convenience
import { createPigeonRTC } from './PigeonRTC.js';
export default createPigeonRTC;
