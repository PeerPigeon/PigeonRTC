/**
 * Simple test for PigeonRTC library
 * Tests basic functionality without requiring @koush/wrtc
 */

import { PigeonRTC, BrowserRTCAdapter, NodeRTCAdapter, RTCAdapter } from '../src/index.js';

// Test 1: Check that classes are exported
console.log('Test 1: Checking exports...');
if (typeof PigeonRTC !== 'function') {
  throw new Error('PigeonRTC not exported correctly');
}
if (typeof BrowserRTCAdapter !== 'function') {
  throw new Error('BrowserRTCAdapter not exported correctly');
}
if (typeof NodeRTCAdapter !== 'function') {
  throw new Error('NodeRTCAdapter not exported correctly');
}
if (typeof RTCAdapter !== 'function') {
  throw new Error('RTCAdapter not exported correctly');
}
console.log('✓ All exports present');

// Test 2: Check RTCAdapter base class
console.log('\nTest 2: Testing RTCAdapter base class...');
const baseAdapter = new RTCAdapter();
try {
  baseAdapter.getRTCPeerConnection();
  throw new Error('Should have thrown error');
} catch (e) {
  if (!e.message.includes('must be implemented')) {
    throw new Error('Wrong error message: ' + e.message);
  }
}
console.log('✓ RTCAdapter base class works correctly');

// Test 3: Check BrowserRTCAdapter
console.log('\nTest 3: Testing BrowserRTCAdapter...');
const browserAdapter = new BrowserRTCAdapter();
console.log('  Adapter name:', browserAdapter.getName());
console.log('  Is supported:', browserAdapter.isSupported());
if (browserAdapter.getName() !== 'BrowserRTCAdapter') {
  throw new Error('Wrong adapter name');
}
console.log('✓ BrowserRTCAdapter instantiates correctly');

// Test 4: Check NodeRTCAdapter
console.log('\nTest 4: Testing NodeRTCAdapter...');
const nodeAdapter = new NodeRTCAdapter();
console.log('  Adapter name:', nodeAdapter.getName());
console.log('  Is supported:', nodeAdapter.isSupported());
if (nodeAdapter.getName() !== 'NodeRTCAdapter') {
  throw new Error('Wrong adapter name');
}
console.log('✓ NodeRTCAdapter instantiates correctly');

// Test 5: Check PigeonRTC class
console.log('\nTest 5: Testing PigeonRTC class...');
const rtc = new PigeonRTC();
if (rtc.initialized) {
  throw new Error('Should not be initialized yet');
}
console.log('✓ PigeonRTC class works correctly');

// Test 6: Test custom adapter
console.log('\nTest 6: Testing custom adapter...');
class MockAdapter extends RTCAdapter {
  getRTCPeerConnection() {
    return function MockRTCPeerConnection() {};
  }
  getRTCSessionDescription() {
    return function MockRTCSessionDescription() {};
  }
  getRTCIceCandidate() {
    return function MockRTCIceCandidate() {};
  }
  isSupported() {
    return true;
  }
  getName() {
    return 'MockAdapter';
  }
}

const mockAdapter = new MockAdapter();
const rtcWithMock = new PigeonRTC({ adapter: mockAdapter });
console.log('✓ Custom adapter works correctly');

// Test 7: Test initialization with custom adapter
console.log('\nTest 7: Testing initialization with custom adapter...');
await rtcWithMock.initialize();
if (!rtcWithMock.initialized) {
  throw new Error('Should be initialized');
}
if (rtcWithMock.getAdapterName() !== 'MockAdapter') {
  throw new Error('Wrong adapter name after initialization');
}
const RTCPeerConnection = rtcWithMock.getRTCPeerConnection();
if (typeof RTCPeerConnection !== 'function') {
  throw new Error('getRTCPeerConnection should return a constructor');
}
console.log('✓ Initialization with custom adapter works');

console.log('\n✅ All tests passed!');
