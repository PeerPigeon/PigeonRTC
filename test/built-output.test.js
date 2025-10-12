/**
 * Test the built output to ensure the build process works correctly
 */

import { PigeonRTC, BrowserRTCAdapter, NodeRTCAdapter, RTCAdapter } from '../dist/index.mjs';

console.log('Testing built output (dist/index.mjs)...\n');

// Test 1: Check that classes are exported
console.log('Test 1: Checking exports from built output...');
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
console.log('✓ All exports present in built output');

// Test 2: Test functionality
console.log('\nTest 2: Testing basic functionality from built output...');
const browserAdapter = new BrowserRTCAdapter();
console.log('  Adapter name:', browserAdapter.getName());
if (browserAdapter.getName() !== 'BrowserRTCAdapter') {
  throw new Error('Wrong adapter name');
}
console.log('✓ Built output works correctly');

console.log('\n✅ Built output tests passed!');
