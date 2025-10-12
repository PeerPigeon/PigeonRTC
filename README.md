# PigeonRTC

The WebRTC engine for PeerPigeon - A pluggable, cross-browser compatible WebRTC library.

## Features

- 🔌 **Pluggable Architecture**: Use different WebRTC implementations through a unified interface
- 🌐 **Cross-Browser Compatible**: Works in all modern browsers with native WebRTC support
- 🖥️ **Node.js Support**: Run WebRTC in Node.js using `@koush/wrtc`
- 🎯 **TypeScript Support**: Full TypeScript type definitions included
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

### Browser Usage

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