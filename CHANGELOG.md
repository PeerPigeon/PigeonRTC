# Changelog

All notable changes to PigeonRTC will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-12

### Added
- Initial release of PigeonRTC
- Core `PigeonRTC` class with automatic adapter detection
- `RTCAdapter` base class for creating custom adapters
- `BrowserRTCAdapter` for native browser WebRTC support
- `NodeRTCAdapter` for Node.js WebRTC using @koush/wrtc
- TypeScript type definitions
- Comprehensive test suite
- Build system using esbuild
- Examples:
  - Basic browser example
  - Basic Node.js example
  - Custom adapter example
  - Interactive HTML demo
- Documentation:
  - README with usage examples
  - Integration guide for PeerPigeon
  - API reference
- ESLint configuration for code quality
- Support for:
  - ESM (`.mjs`)
  - CommonJS (`.js`)
  - Browser bundle (`.js`)
  - Minified browser bundle (`.min.js`)

### Features
- Pluggable adapter architecture
- Cross-browser compatibility
- Node.js support with @koush/wrtc
- Automatic environment detection
- getUserMedia support
- getDisplayMedia support (where available)
- Full WebRTC API pass-through
- Zero runtime overhead
- Small bundle size (~6.5KB minified)

### Tested On
- Node.js 14+
- Modern browsers (Chrome, Firefox, Safari, Edge)
