# PigeonRTC

The WebRTC engine for PeerPigeon - A pluggable, cross-browser compatible WebRTC library with **built-in WebSocket signaling**.

## Features

- 🔌 **Pluggable Architecture**: Use different WebRTC implementations through a unified interface
- 🌐 **Cross-Browser Compatible**: Works in all modern browsers with native WebRTC support
- 🖥️ **Node.js Support**: Run WebRTC in Node.js using `@koush/wrtc`
- 📡 **Built-in Signaling**: WebSocket-based signaling client and managed peer connections included
- � **mDNS Resolution**: Automatic .local hostname resolution for local network peer discovery
- �🎯 **TypeScript Support**: Full TypeScript type definitions included
- 🪶 **Lightweight**: Minimal dependencies and small bundle size
- 🔧 **Easy to Use**: Simple, intuitive API

## Installation

```bash
npm install pigeonrtc
```

For Node.js environments, also install the optional peer dependency:

```bash
npm install @koush/wrtc
```

## Quick Start

### Easy Mode: Built-in Signaling (Recommended)

```javascript
import { createPigeonRTC } from 'pigeonrtc';

// Initialize PigeonRTC
const rtc = await createPigeonRTC();

// Get local media
const localStream = await rtc.getUserMedia({ video: true, audio: true });

// Create signaling client (connects to your WebSocket signaling server)
const signalingClient = rtc.createSignalingClient('ws://localhost:9090');

// Listen for connection and client list
signalingClient.addEventListener('connected', () => {
  console.log('Connected to signaling server');
});

signalingClient.addEventListener('clients', (event) => {
  console.log('Available peers:', event.detail.clients);
});

// Connect to server
await signalingClient.connect();

// Create managed peer connection (handles signaling automatically!)
const peerConnection = rtc.createManagedPeerConnection(signalingClient);

// Listen for remote video
peerConnection.addEventListener('track', (event) => {
  remoteVideo.srcObject = event.detail.streams[0];
});

// Connect to a peer (that's it - signaling is handled automatically!)
await peerConnection.connect(remotePeerId, localStream);
```

### Advanced: Manual WebRTC (for custom signaling)

```javascript
import { createPigeonRTC } from 'pigeonrtc';

// Initialize PigeonRTC (auto-detects environment)
const rtc = await createPigeonRTC();

// Create a peer connection
const peerConnection = rtc.createPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
});

// Use it like a normal RTCPeerConnection
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    console.log('New ICE candidate:', event.candidate);
  }
};

// Create an offer

const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
```

### Node.js Usage

```javascript
import { createPigeonRTC } from 'pigeonrtc';

// In Node.js, PigeonRTC automatically uses @koush/wrtc
const rtc = await createPigeonRTC();

// Everything else works the same as in browser
const peerConnection = rtc.createPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// ... use peerConnection as normal
```

### mDNS Support for .local ICE Candidates

PigeonRTC includes built-in support for resolving `.local` mDNS hostnames in ICE candidates using the `pigeonns` library. This is particularly useful for local network discovery and peer-to-peer connections without a STUN/TURN server.

**Automatic Resolution:**

When using managed peer connections (`createManagedPeerConnection`), mDNS resolution is enabled by default:

```javascript
import { createPigeonRTC } from 'pigeonrtc';

const rtc = await createPigeonRTC();
const signalingClient = rtc.createSignalingClient('ws://localhost:9090');
await signalingClient.connect();

// mDNS resolution is enabled by default
const peerConnection = rtc.createManagedPeerConnection(signalingClient);

// .local ICE candidates are automatically resolved to IP addresses
await peerConnection.connect(remotePeerId);
```

**Disable mDNS Resolution:**

You can disable mDNS resolution if needed:

```javascript
// Disable mDNS resolution
const peerConnection = rtc.createManagedPeerConnection(signalingClient, {
  enableMDNS: false,
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});
```

**Manual mDNS Resolution:**

For advanced use cases, you can use the `MDNSResolver` directly:

```javascript
import { MDNSResolver } from 'pigeonrtc';

const resolver = new MDNSResolver();
await resolver.initialize();

// Check if a candidate contains .local
if (resolver.isLocalCandidate(candidate)) {
  // Resolve the candidate
  const resolvedCandidate = await resolver.resolveCandidate(candidate);
  if (resolvedCandidate) {
    console.log('Resolved:', resolvedCandidate);
  }
}

// Resolve a hostname directly
const ip = await resolver.resolve('myhost.local');
console.log('IP address:', ip);

// Clean up
resolver.dispose();
```

**How it works:**

1. When an ICE candidate containing a `.local` hostname is generated or received
2. The `MDNSResolver` automatically detects it
3. Uses `pigeonns` to perform mDNS lookup on the local network
4. Replaces the `.local` hostname with the resolved IP address
5. The resolved candidate is sent/used for the peer connection

This enables seamless local network peer discovery without manual configuration!

### Using Custom Adapters

You can create custom adapters for specialized WebRTC implementations:

```javascript
import { PigeonRTC, RTCAdapter } from 'pigeonrtc';

class MyCustomAdapter extends RTCAdapter {
  getRTCPeerConnection() {
    return MyCustomRTCPeerConnection;
  }
  
  getRTCSessionDescription() {
    return MyCustomRTCSessionDescription;
  }
  
  getRTCIceCandidate() {
    return MyCustomRTCIceCandidate;
  }
  
  isSupported() {
    return true;
  }
  
  getName() {
    return 'MyCustomAdapter';
  }
}

const rtc = await createPigeonRTC({
  adapter: new MyCustomAdapter()
});
```

## API Reference

### `createPigeonRTC(options)`

Creates and initializes a new PigeonRTC instance.

**Parameters:**
- `options` (Object, optional)
  - `adapter` (RTCAdapter, optional): Custom adapter to use
  - `preferNode` (boolean, optional): Prefer Node adapter even in browser (for testing)

**Returns:** `Promise<PigeonRTC>`

### `PigeonRTC` Class

#### Methods

##### `initialize(options)`

Initialize PigeonRTC with automatic adapter detection or custom adapter.

**Parameters:**
- `options` (Object, optional): Same as `createPigeonRTC` options

**Returns:** `Promise<void>`

##### `createPeerConnection(config)`

Create a new RTCPeerConnection with the given configuration.

**Parameters:**
- `config` (RTCConfiguration, optional): RTCPeerConnection configuration

**Returns:** `RTCPeerConnection`

##### `getRTCPeerConnection()`

Get the RTCPeerConnection class from the current adapter.

**Returns:** `typeof RTCPeerConnection`

##### `getRTCSessionDescription()`

Get the RTCSessionDescription class from the current adapter.

**Returns:** `typeof RTCSessionDescription`

##### `getRTCIceCandidate()`

Get the RTCIceCandidate class from the current adapter.

**Returns:** `typeof RTCIceCandidate`

##### `getMediaStream()`

Get the MediaStream class from the current adapter (if supported).

**Returns:** `typeof MediaStream | null`

##### `getUserMedia(constraints)`

Get user media stream (camera/microphone).

**Parameters:**
- `constraints` (MediaStreamConstraints): Media constraints

**Returns:** `Promise<MediaStream>`

##### `getDisplayMedia(constraints)`

Get display media stream (screen sharing).

**Parameters:**
- `constraints` (MediaStreamConstraints): Display constraints

**Returns:** `Promise<MediaStream>`

##### `isSupported()`

Check if WebRTC is supported in the current environment.

**Returns:** `boolean`

##### `getAdapterName()`

Get the name of the current adapter.

**Returns:** `string`

## Adapters

### BrowserRTCAdapter

Uses the browser's native WebRTC implementation. Automatically selected when running in a browser environment.

### NodeRTCAdapter

Uses `@koush/wrtc` for WebRTC in Node.js. Automatically selected when running in Node.js with `@koush/wrtc` installed.

### Custom Adapters

You can create custom adapters by extending the `RTCAdapter` base class and implementing the required methods:

- `getRTCPeerConnection()`: Return the RTCPeerConnection class
- `getRTCSessionDescription()`: Return the RTCSessionDescription class
- `getRTCIceCandidate()`: Return the RTCIceCandidate class
- `getMediaStream()`: Return the MediaStream class (or null)
- `isSupported()`: Return true if the adapter works in current environment
- `getName()`: Return the adapter name
- `initialize()`: Perform any async initialization (optional)
- `getUserMedia(constraints)`: Get user media (optional)
- `getDisplayMedia(constraints)`: Get display media (optional)

## Integration with PeerPigeon

PigeonRTC is designed to be a drop-in replacement for direct WebRTC usage in PeerPigeon:

```javascript
// Before (direct WebRTC)
const pc = new RTCPeerConnection(config);

// After (with PigeonRTC)
import { createPigeonRTC } from 'pigeonrtc';
const rtc = await createPigeonRTC();
const pc = rtc.createPeerConnection(config);
```

## Browser Support

- Chrome/Edge 56+
- Firefox 44+
- Safari 11+
- Opera 43+

## Node.js Support

- Node.js 14.0.0 or higher
- Requires `@koush/wrtc` package

## License

MIT © PeerPigeon

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [GitHub Repository](https://github.com/PeerPigeon/PigeonRTC)
- [PeerPigeon](https://github.com/PeerPigeon/PeerPigeon)
- [Issues](https://github.com/PeerPigeon/PigeonRTC/issues)