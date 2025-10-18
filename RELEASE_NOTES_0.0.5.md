# PigeonRTC v0.0.5 - Cross-Browser mDNS Resolution

## 🎉 What's New

**Cross-platform `.local` ICE candidate resolution is now fully functional in both Node.js AND browsers!**

## ✅ Updated Features

### 1. **Browser Support via HTTP API**
- Uses `pigeonns` v1.0.2's new HTTP server feature
- Browsers can now resolve `.local` candidates by connecting to a local pigeonns server
- No more "browser not supported" - **fully cross-platform**!

### 2. **Automatic Environment Detection**
- **Node.js**: Uses direct mDNS multicast queries (no server needed)
- **Browser**: Uses HTTP API client to connect to pigeonns server
- Seamless automatic switching based on environment

### 3. **Configurable Server URL**
```javascript
const peerConnection = rtc.createManagedPeerConnection(signalingClient, {
  mdnsServerUrl: 'http://localhost:5380', // Custom server URL
  enableMDNS: true
});
```

## 🚀 Quick Start

### For Browser Users

**Step 1:** Start the pigeonns server
```bash
# In a terminal
npx pigeonns serve
```

**Step 2:** Use PigeonRTC normally
```javascript
import { createPigeonRTC } from 'pigeonrtc';

const rtc = await createPigeonRTC();
const peerConnection = rtc.createManagedPeerConnection(signalingClient);
// mDNS resolution works automatically! 🎊
```

### For Node.js Users

No changes needed! Works exactly as before with direct mDNS:

```javascript
const { createPigeonRTC } = require('pigeonrtc');

const rtc = await createPigeonRTC();
const peerConnection = rtc.createManagedPeerConnection(signalingClient);
// Direct mDNS resolution - no server needed
```

## 📋 Technical Details

### How It Works

#### Node.js Mode
```
.local candidate detected
    ↓
Import pigeonns library
    ↓
Create MDNSResolver instance
    ↓
Start multicast DNS listener
    ↓
Query local network
    ↓
Resolve to IP address
```

#### Browser Mode
```
.local candidate detected
    ↓
Check if pigeonns server is running (http://localhost:5380/health)
    ↓
Send HTTP GET: /resolve?name=abc123.local&type=A
    ↓
Server queries local network via mDNS
    ↓
Returns JSON: {"address": "192.168.1.100"}
    ↓
Update candidate with IP
```

### API Changes

#### MDNSResolver Constructor
```javascript
new MDNSResolver({
  serverUrl: 'http://localhost:5380' // Optional, browser only
})
```

#### PeerConnection Config
```javascript
rtc.createManagedPeerConnection(signalingClient, {
  enableMDNS: true,                    // Enable/disable mDNS (default: true)
  mdnsServerUrl: 'http://localhost:5380' // Custom server URL (default shown)
})
```

## 🔧 Files Changed

1. **src/MDNSResolver.js**
   - Added browser HTTP API client mode
   - Added automatic environment detection
   - Added health check for server availability
   - Added proper cleanup for Node.js resolver

2. **src/PeerConnection.js**
   - Added `mdnsServerUrl` config option
   - Passes serverUrl to MDNSResolver

3. **types/index.d.ts**
   - Updated MDNSResolver constructor types
   - Updated PeerConnection config types

4. **README.md**
   - Added browser setup instructions
   - Added pigeonns server startup docs
   - Added custom server URL examples

5. **examples/browser-mdns.html** (NEW)
   - Interactive browser example
   - Real-time resolution testing
   - Status monitoring

## 🧪 Testing

All existing tests pass:
```
✅ All tests passed!
```

Browser testing:
1. Open `examples/browser-mdns.html` in a browser
2. Start `npx pigeonns serve` in terminal
3. Test resolving `.local` hostnames

## 📦 Dependencies

Updated:
- `pigeonns`: ^1.0.2 (was ^1.0.1)

## 🐛 Known Issues / Limitations

1. **Browser mode requires pigeonns server** - If the server isn't running, mDNS resolution is disabled (graceful fallback)
2. **CORS** - Server must have CORS enabled (pigeonns does this by default)
3. **Local network only** - mDNS only works on local networks (by design)

## 🎯 Usage in PeerPigeon

To enable mDNS resolution in your PeerPigeon app:

### 1. Start pigeonns server
```bash
npx pigeonns serve
```

### 2. Use in your app
```javascript
// If using PigeonRTC directly
const peerConnection = rtc.createManagedPeerConnection(signalingClient, {
  enableMDNS: true // Now works in browsers too!
});
```

### 3. Embed server in Node.js (optional)
If you're running a Node.js server alongside your browser app:

```javascript
const MDNSResolver = require('pigeonns');

const resolver = new MDNSResolver({
  server: true,
  serverPort: 5380,
  serverHost: 'localhost',
  cors: true
});

resolver.start();

resolver.on('server-started', ({ url }) => {
  console.log(`✓ pigeonns server started at ${url}`);
});
```

## 🚢 Publishing

Ready to publish:
```bash
npm publish
```

## 📝 Version History

- **v0.0.5**: Cross-browser mDNS via HTTP API
- **v0.0.4**: Initial mDNS support (Node.js only)
- **v0.0.3**: Core WebRTC functionality

---

**This fixes your file transfer issue if it was related to .local candidates not being resolved properly in browsers!** 🎊
