# PigeonRTC Integration Guide for PeerPigeon

This guide explains how to integrate PigeonRTC into the PeerPigeon project as a replacement for direct WebRTC usage.

## Overview

PigeonRTC provides a pluggable abstraction layer over WebRTC implementations, allowing PeerPigeon to work seamlessly across different environments (browser, Node.js) without changing code.

## Benefits

1. **Cross-platform compatibility**: Automatic detection and use of appropriate WebRTC implementation
2. **Cleaner code**: Single API instead of environment-specific checks
3. **Easier testing**: Mock adapters can be used for testing
4. **Future-proof**: Easy to add support for new WebRTC implementations (e.g., React Native)

## Installation

Add PigeonRTC to your project:

```bash
npm install pigeonrtc
```

For Node.js support, also install:

```bash
npm install @koush/wrtc
```

## Migration Steps

### 1. Initialize PigeonRTC in PeerPigeonMesh

In `src/PeerPigeonMesh.js`, add initialization:

```javascript
import { createPigeonRTC } from 'pigeonrtc';

export class PeerPigeonMesh extends EventEmitter {
  constructor(options = {}) {
    super();
    // ... existing code ...
    
    // Add PigeonRTC initialization
    this.rtc = null;
  }

  async initialize() {
    // Initialize PigeonRTC
    this.rtc = await createPigeonRTC();
    
    // ... rest of initialization ...
  }
}
```

### 2. Update PeerConnection class

Replace direct WebRTC usage in `src/PeerConnection.js`:

**Before:**
```javascript
this.connection = new RTCPeerConnection({
  iceServers: [...],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require'
});
```

**After:**
```javascript
// Pass rtc instance from PeerPigeonMesh
constructor(peerId, isInitiator = false, options = {}) {
  super();
  this.rtc = options.rtc; // PigeonRTC instance
  // ... rest of constructor ...
}

async createConnection() {
  this.connection = this.rtc.createPeerConnection({
    iceServers: [...],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  });
  
  // ... rest of method ...
}
```

### 3. Update EnvironmentDetector

Simplify WebRTC detection in `src/EnvironmentDetector.js`:

**Before:**
```javascript
get hasWebRTC() {
  if (this.isNode) {
    try {
      require.resolve('@koush/wrtc');
      return true;
    } catch (e) {
      return false;
    }
  }
  return typeof RTCPeerConnection !== 'undefined';
}
```

**After:**
```javascript
async hasWebRTC() {
  try {
    const rtc = await createPigeonRTC();
    return rtc.isSupported();
  } catch (e) {
    return false;
  }
}
```

### 4. Update MediaManager

Update media handling in `src/MediaManager.js`:

**Before:**
```javascript
async getUserMedia(constraints) {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return await navigator.mediaDevices.getUserMedia(constraints);
  }
  throw new Error('getUserMedia not supported');
}
```

**After:**
```javascript
constructor(rtc) {
  this.rtc = rtc; // PigeonRTC instance
}

async getUserMedia(constraints) {
  return await this.rtc.getUserMedia(constraints);
}
```

## Example: Complete Integration

Here's a complete example of how PeerConnection might look after integration:

```javascript
import { EventEmitter } from './EventEmitter.js';
import DebugLogger from './DebugLogger.js';

export class PeerConnection extends EventEmitter {
  constructor(peerId, isInitiator = false, options = {}) {
    super();
    this.peerId = peerId;
    this.rtc = options.rtc; // PigeonRTC instance
    this.debug = DebugLogger.create('PeerConnection');
    this.isInitiator = isInitiator;
    this.connection = null;
    this.dataChannel = null;
    // ... rest of properties ...
  }

  async createConnection() {
    // Validate WebRTC support
    if (!this.rtc || !this.rtc.isSupported()) {
      const error = new Error('WebRTC not supported in this environment');
      this.emit('connectionFailed', { peerId: this.peerId, reason: error.message });
      throw error;
    }

    // Create peer connection using PigeonRTC
    this.connection = this.rtc.createPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    this.setupConnectionHandlers();

    // Add media tracks if needed
    if (this.localStream) {
      await this.addLocalStreamWithAddTrack(this.localStream);
    }

    // Set up data channel
    if (this.isInitiator) {
      this.dataChannel = this.connection.createDataChannel('messages', {
        ordered: true
      });
      this.setupDataChannel();
    } else {
      this.connection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };
    }
  }
  
  // ... rest of class remains the same ...
}
```

## Testing

### Unit Tests

Create mock adapters for testing:

```javascript
import { RTCAdapter } from 'pigeonrtc';

class MockRTCAdapter extends RTCAdapter {
  getRTCPeerConnection() {
    return MockRTCPeerConnection; // Your mock class
  }
  
  // ... implement other methods ...
}

// In tests
const rtc = await createPigeonRTC({
  adapter: new MockRTCAdapter()
});
```

### Integration Tests

Test with real WebRTC in both browser and Node.js:

```javascript
// Browser test
import { createPigeonRTC } from 'pigeonrtc';

const rtc = await createPigeonRTC();
assert(rtc.getAdapterName() === 'BrowserRTCAdapter');

// Node.js test
const rtc = await createPigeonRTC();
assert(rtc.getAdapterName() === 'NodeRTCAdapter');
```

## Backward Compatibility

During migration, you can support both old and new approaches:

```javascript
async createConnection() {
  if (this.rtc) {
    // New approach with PigeonRTC
    this.connection = this.rtc.createPeerConnection(config);
  } else {
    // Old approach (fallback)
    this.connection = new RTCPeerConnection(config);
  }
  // ... rest of method ...
}
```

## Advanced Usage

### Custom STUN/TURN Servers

```javascript
const rtc = await createPigeonRTC();

const pc = rtc.createPeerConnection({
  iceServers: [
    { urls: 'stun:your-stun-server.com:3478' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
});
```

### Media Stream Handling

```javascript
const rtc = await createPigeonRTC();

// Get user media
const stream = await rtc.getUserMedia({
  audio: true,
  video: { width: 1280, height: 720 }
});

// Add to peer connection
const pc = rtc.createPeerConnection(config);
stream.getTracks().forEach(track => {
  pc.addTrack(track, stream);
});
```

### React Native Support (Future)

When React Native support is needed, just create a new adapter:

```javascript
import { RTCAdapter } from 'pigeonrtc';
import { RTCPeerConnection } from 'react-native-webrtc';

class ReactNativeRTCAdapter extends RTCAdapter {
  getRTCPeerConnection() {
    return RTCPeerConnection;
  }
  // ... implement other methods ...
}

// Use it
const rtc = await createPigeonRTC({
  adapter: new ReactNativeRTCAdapter()
});
```

## Troubleshooting

### Issue: "WebRTC not supported"

**Solution**: Make sure @koush/wrtc is installed for Node.js:
```bash
npm install @koush/wrtc
```

### Issue: "NodeRTCAdapter not initialized"

**Solution**: Ensure you call `initialize()` before using:
```javascript
const rtc = await createPigeonRTC(); // initialize is called automatically
```

### Issue: Browser adapter not detected

**Solution**: Check browser compatibility. PigeonRTC requires a modern browser with WebRTC support.

## Performance Considerations

PigeonRTC adds minimal overhead:

- **Bundle size**: ~6.5KB minified
- **Initialization**: <1ms in most environments
- **Runtime overhead**: None - direct pass-through to native WebRTC

## Next Steps

1. Start with updating `PeerConnection.js`
2. Then update `PeerPigeonMesh.js` to initialize PigeonRTC
3. Update tests to use mock adapters
4. Gradually migrate other files that use WebRTC directly
5. Remove environment-specific WebRTC checks from EnvironmentDetector

## Support

For issues or questions:
- [PigeonRTC Issues](https://github.com/PeerPigeon/PigeonRTC/issues)
- [PeerPigeon Issues](https://github.com/PeerPigeon/PeerPigeon/issues)
