/**
 * Example: Using mDNS .local hostname resolution with PigeonRTC
 * 
 * This example demonstrates how PigeonRTC automatically resolves .local
 * hostnames in ICE candidates for local network peer discovery.
 */

import { createPigeonRTC, MDNSResolver } from '../src/index.js';

async function exampleWithManagedConnection() {
  console.log('\n=== Example 1: Automatic mDNS Resolution with Managed Connections ===\n');
  
  // Initialize PigeonRTC
  const rtc = await createPigeonRTC();
  
  // Create signaling client
  const signalingClient = rtc.createSignalingClient('ws://localhost:9090');
  
  // Listen for connection events
  signalingClient.addEventListener('connected', () => {
    console.log('✓ Connected to signaling server');
  });
  
  signalingClient.addEventListener('clients', (event) => {
    console.log('✓ Available peers:', event.detail.clients);
  });
  
  // Create managed peer connection with mDNS enabled (default)
  const peerConnection = rtc.createManagedPeerConnection(signalingClient, {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
    // enableMDNS is true by default - .local candidates will be auto-resolved
  });
  
  peerConnection.addEventListener('connected', () => {
    console.log('✓ Peer connection established!');
  });
  
  peerConnection.addEventListener('track', (event) => {
    console.log('✓ Received remote track:', event.detail.track);
  });
  
  console.log('Note: mDNS resolution is enabled by default.');
  console.log('When ICE candidates with .local hostnames are generated,');
  console.log('they will be automatically resolved to IP addresses.');
  
  // To connect to a peer (requires signaling server running):
  // await signalingClient.connect();
  // await peerConnection.connect(remotePeerId);
}

async function exampleDisableMDNS() {
  console.log('\n=== Example 2: Disabling mDNS Resolution ===\n');
  
  const rtc = await createPigeonRTC();
  const signalingClient = rtc.createSignalingClient('ws://localhost:9090');
  
  // Explicitly disable mDNS resolution
  const peerConnection = rtc.createManagedPeerConnection(signalingClient, {
    enableMDNS: false,
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  });
  
  console.log('✓ Peer connection created with mDNS disabled');
  console.log('   .local candidates will NOT be resolved');
}

async function exampleManualMDNS() {
  console.log('\n=== Example 3: Manual mDNS Resolution ===\n');
  
  // Create a standalone mDNS resolver
  const resolver = new MDNSResolver();
  await resolver.initialize();
  
  if (resolver.isAvailable()) {
    console.log('✓ mDNS resolver initialized successfully');
    
    // Example: Resolve a hostname
    console.log('\nResolving hostname: myhost.local');
    const ip = await resolver.resolve('myhost.local');
    if (ip) {
      console.log('✓ Resolved to IP:', ip);
    } else {
      console.log('✗ Could not resolve hostname (host may not exist on network)');
    }
    
    // Example: Check and resolve a candidate
    const exampleCandidate = {
      candidate: 'candidate:1 1 udp 2113937151 myhost.local 54321 typ host',
      sdpMid: '0',
      sdpMLineIndex: 0
    };
    
    console.log('\nChecking candidate:', exampleCandidate.candidate);
    if (resolver.isLocalCandidate(exampleCandidate)) {
      console.log('✓ Candidate contains .local hostname');
      
      const resolved = await resolver.resolveCandidate(exampleCandidate);
      if (resolved) {
        console.log('✓ Resolved candidate:', resolved.candidate);
      } else {
        console.log('✗ Could not resolve candidate');
      }
    }
    
    // Clean up
    resolver.dispose();
    console.log('\n✓ Resolver disposed');
  } else {
    console.log('✗ mDNS resolver not available (pigeonns may not be installed)');
  }
}

async function exampleCaching() {
  console.log('\n=== Example 4: mDNS Resolution Caching ===\n');
  
  const resolver = new MDNSResolver();
  await resolver.initialize();
  
  if (resolver.isAvailable()) {
    console.log('✓ mDNS resolver initialized');
    
    // First resolution - will query the network
    console.log('\nFirst resolution (queries network):');
    const start1 = Date.now();
    const ip1 = await resolver.resolve('localhost.local');
    const time1 = Date.now() - start1;
    console.log(`  Result: ${ip1 || 'not found'} (took ${time1}ms)`);
    
    // Second resolution - will use cache
    console.log('\nSecond resolution (uses cache):');
    const start2 = Date.now();
    const ip2 = await resolver.resolve('localhost.local');
    const time2 = Date.now() - start2;
    console.log(`  Result: ${ip2 || 'not found'} (took ${time2}ms)`);
    
    // Clear cache
    resolver.clearCache();
    console.log('\n✓ Cache cleared');
    
    // Third resolution - will query again
    console.log('\nThird resolution (cache cleared, queries network):');
    const start3 = Date.now();
    const ip3 = await resolver.resolve('localhost.local');
    const time3 = Date.now() - start3;
    console.log(`  Result: ${ip3 || 'not found'} (took ${time3}ms)`);
    
    resolver.dispose();
  } else {
    console.log('✗ mDNS resolver not available');
  }
}

// Run examples
async function runExamples() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║  PigeonRTC mDNS .local Hostname Resolution Examples       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    await exampleWithManagedConnection();
    await exampleDisableMDNS();
    await exampleManualMDNS();
    await exampleCaching();
    
    console.log('\n✅ All examples completed!\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}

runExamples();
