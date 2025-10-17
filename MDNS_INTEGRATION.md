# mDNS Integration with PigeonNS

## Overview

PigeonRTC now includes integrated support for resolving `.local` mDNS hostnames in WebRTC ICE candidates using the `pigeonns` npm package. This enables automatic local network peer discovery without requiring external STUN/TURN servers.

## Changes Made

### 1. Dependencies

- Added `pigeonns` (v1.0.1) as an optional dependency
- Marked as optional since it's primarily for Node.js environments and local network scenarios
- Updated build script to externalize `pigeonns` for browser compatibility

### 2. New Module: `MDNSResolver.js`

Created a comprehensive mDNS resolver with the following features:

- **Automatic hostname detection**: Identifies `.local` hostnames in ICE candidates
- **Resolution**: Uses `pigeonns` to perform mDNS lookups on the local network
- **Caching**: 60-second TTL cache to reduce network queries
- **Candidate transformation**: Automatically replaces `.local` hostnames with resolved IP addresses

Key methods:
- `initialize()`: Initializes the pigeonns resolver
- `isAvailable()`: Checks if mDNS resolution is available
- `isLocalCandidate(candidate)`: Detects .local hostnames in candidates
- `resolve(hostname)`: Resolves a hostname to an IP address
- `resolveCandidate(candidate)`: Resolves and transforms an entire ICE candidate
- `clearCache()`: Clears the resolution cache
- `dispose()`: Cleanup method

### 3. PeerConnection Integration

Modified `PeerConnection.js` to automatically resolve mDNS candidates:

- Added `mdnsResolver` instance to each peer connection
- Added `enableMDNS` config option (default: `true`)
- Updated `onicecandidate` handler to resolve outgoing .local candidates
- Updated `handleIceCandidate()` to resolve incoming .local candidates
- Added cleanup in `close()` method

### 4. TypeScript Definitions

Updated `types/index.d.ts` with:

- `MDNSResolver` class definition
- Updated `PeerConnection` constructor to include `enableMDNS` option
- Full type coverage for all mDNS-related methods

### 5. Documentation

Updated `README.md` with:

- New feature bullet point for mDNS resolution
- Comprehensive mDNS usage section with examples
- Configuration options (enable/disable)
- Manual resolver usage examples

### 6. Examples

Created `examples/mdns-example.js` demonstrating:

- Automatic mDNS resolution with managed connections
- Disabling mDNS when not needed
- Manual mDNS resolver usage
- Resolution caching behavior

## How It Works

### Automatic Resolution Flow

1. **Outgoing candidates**: When a peer connection generates an ICE candidate containing `.local`:
   ```
   candidate:1 1 udp 2113937151 myhost.local 54321 typ host
   ```

2. **Detection**: The `MDNSResolver` detects the `.local` hostname

3. **Resolution**: Uses `pigeonns` to query the local network via mDNS

4. **Transformation**: Replaces the hostname with the resolved IP:
   ```
   candidate:1 1 udp 2113937151 192.168.1.100 54321 typ host
   ```

5. **Signaling**: The resolved candidate is sent to the remote peer

### Incoming Candidates

The same process applies to incoming candidates before they're added to the peer connection, ensuring both peers can establish connections even when .local hostnames are used.

## Usage Examples

### Basic (Automatic - Recommended)

```javascript
import { createPigeonRTC } from 'pigeonrtc';

const rtc = await createPigeonRTC();
const signalingClient = rtc.createSignalingClient('ws://localhost:9090');
const peerConnection = rtc.createManagedPeerConnection(signalingClient);
// mDNS is enabled by default - nothing else needed!
```

### Disable mDNS

```javascript
const peerConnection = rtc.createManagedPeerConnection(signalingClient, {
  enableMDNS: false
});
```

### Manual Resolution

```javascript
import { MDNSResolver } from 'pigeonrtc';

const resolver = new MDNSResolver();
await resolver.initialize();

const ip = await resolver.resolve('myhost.local');
console.log('Resolved to:', ip);

resolver.dispose();
```

## Benefits

1. **Zero Configuration**: Works automatically when enabled
2. **Local Network Discovery**: Enables peer discovery without internet connectivity
3. **No STUN/TURN Required**: For local network scenarios
4. **Transparent**: No code changes needed for existing applications
5. **Optional**: Can be disabled if not needed
6. **Cached**: Reduces network overhead with intelligent caching
7. **Cross-platform**: Works in both browser and Node.js environments

## Testing

All existing tests pass with the new integration. The mDNS functionality is optional and doesn't break existing behavior.

Build output:
```
✓ Built ESM module (dist/index.mjs)
✓ Built CommonJS module (dist/index.js)
✓ Built browser bundle (dist/browser.js)
✓ Built minified browser bundle (dist/browser.min.js)
✅ Build completed successfully!
```

Test output:
```
✅ All tests passed!
```

## Future Enhancements

Possible improvements:
- Configurable cache TTL
- Multiple resolution strategies
- Fallback mechanisms
- DNS-SD service discovery integration
- Performance metrics and logging
