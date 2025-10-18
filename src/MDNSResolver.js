/**
 * mDNS Resolver for handling .local ICE candidates
 * Uses pigeonns for resolving mDNS hostnames to IP addresses
 * Supports both Node.js (direct mDNS) and Browser (HTTP API) environments
 */
export class MDNSResolver {
  constructor(options = {}) {
    this._resolver = null;
    this._initialized = false;
    this._cache = new Map();
    this._cacheTimeout = 60000; // 60 seconds cache TTL
    this._mode = null; // 'node' or 'browser'
    this._serverUrl = options.serverUrl || 'http://localhost:5380'; // pigeonns HTTP server
  }

  /**
   * Initialize the mDNS resolver
   * Automatically detects Node.js vs Browser environment
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) {
      return;
    }

    // Detect environment
    const isNode = typeof process !== 'undefined' && 
                   process.versions != null && 
                   process.versions.node != null;

    if (isNode) {
      // Node.js: Use direct mDNS resolver
      try {
        const pigeonnsModule = await import('pigeonns');
        const MDNSResolver = pigeonnsModule.default || pigeonnsModule;
        this._resolver = new MDNSResolver({
          timeout: 5000,
          ttl: 60, // Match our cache timeout
          cacheSize: 1000
        });
        this._resolver.start();
        this._mode = 'node';
        this._initialized = true;
        console.log('✓ mDNS resolver initialized (Node.js mode)');
      } catch (error) {
        console.warn('Failed to initialize Node.js mDNS resolver:', error.message);
        this._initialized = false;
      }
    } else {
      // Browser: Use HTTP API client
      try {
        // Test if pigeonns server is available
        const response = await fetch(`${this._serverUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        
        if (response.ok) {
          this._mode = 'browser';
          this._initialized = true;
          console.log(`✓ mDNS resolver initialized (Browser mode) - Server: ${this._serverUrl}`);
        } else {
          console.warn(`pigeonns server not responding at ${this._serverUrl}`);
          this._initialized = false;
        }
      } catch (error) {
        console.warn(`Failed to connect to pigeonns server at ${this._serverUrl}:`, error.message);
        console.warn('mDNS resolution will be disabled. Start pigeonns server with: npx pigeonns serve');
        this._initialized = false;
      }
    }
  }

  /**
   * Check if the resolver is available and initialized
   * @returns {boolean}
   */
  isAvailable() {
    return this._initialized && this._resolver !== null;
  }

  /**
   * Check if an ICE candidate contains a .local hostname
   * @param {RTCIceCandidateInit} candidate - ICE candidate to check
   * @returns {boolean}
   */
  isLocalCandidate(candidate) {
    if (!candidate || !candidate.candidate) {
      return false;
    }

    // Check if the candidate string contains .local
    return candidate.candidate.includes('.local');
  }

  /**
   * Extract hostname from ICE candidate string
   * @param {string} candidateString - ICE candidate string
   * @returns {string|null} - Extracted hostname or null
   * @private
   */
  _extractHostname(candidateString) {
    // ICE candidate format: "candidate:... typ ... ..."
    // Example: "candidate:1 1 udp 2113937151 hostname.local 54321 typ host"
    const parts = candidateString.split(' ');
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].endsWith('.local')) {
        return parts[i];
      }
    }
    
    return null;
  }

  /**
   * Get cached IP address for hostname
   * @param {string} hostname - Hostname to lookup
   * @returns {string|null}
   * @private
   */
  _getCachedIP(hostname) {
    const cached = this._cache.get(hostname);
    if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
      return cached.ip;
    }
    return null;
  }

  /**
   * Set cached IP address for hostname
   * @param {string} hostname - Hostname to cache
   * @param {string} ip - IP address to cache
   * @private
   */
  _setCachedIP(hostname, ip) {
    this._cache.set(hostname, {
      ip,
      timestamp: Date.now()
    });
  }

  /**
   * Resolve a .local hostname to an IP address using mDNS
   * Works in both Node.js (direct mDNS) and Browser (HTTP API) modes
   * @param {string} hostname - Hostname to resolve (e.g., "myhost.local")
   * @returns {Promise<string|null>} - Resolved IP address or null if resolution fails
   */
  async resolve(hostname) {
    if (!this.isAvailable()) {
      console.warn('mDNS resolver not available');
      return null;
    }

    // Check cache first
    const cachedIP = this._getCachedIP(hostname);
    if (cachedIP) {
      return cachedIP;
    }

    try {
      let ip = null;

      if (this._mode === 'node') {
        // Node.js: Use direct mDNS resolver
        ip = await this._resolver.resolve(hostname, 'A');
      } else if (this._mode === 'browser') {
        // Browser: Use HTTP API
        const response = await fetch(
          `${this._serverUrl}/resolve?name=${encodeURIComponent(hostname)}&type=A`,
          {
            method: 'GET',
            signal: AbortSignal.timeout(5000) // 5 second timeout
          }
        );

        if (response.ok) {
          const data = await response.json();
          ip = data.address;
        } else {
          console.warn(`Failed to resolve ${hostname}: HTTP ${response.status}`);
        }
      }
      
      if (ip) {
        this._setCachedIP(hostname, ip);
        return ip;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to resolve ${hostname}:`, error.message);
      return null;
    }
  }

  /**
   * Resolve an ICE candidate that contains a .local hostname
   * Returns a new candidate with the hostname replaced by the IP address
   * @param {RTCIceCandidateInit} candidate - ICE candidate to resolve
   * @returns {Promise<RTCIceCandidateInit|null>} - Resolved candidate or null
   */
  async resolveCandidate(candidate) {
    if (!candidate || !candidate.candidate) {
      return null;
    }

    if (!this.isLocalCandidate(candidate)) {
      // Not a .local candidate, return as-is
      return candidate;
    }

    const hostname = this._extractHostname(candidate.candidate);
    if (!hostname) {
      console.warn('Could not extract hostname from candidate:', candidate.candidate);
      return null;
    }

    const ip = await this.resolve(hostname);
    if (!ip) {
      console.warn(`Could not resolve ${hostname} to IP address`);
      return null;
    }

    // Create a new candidate with the hostname replaced by the IP
    const resolvedCandidateString = candidate.candidate.replace(hostname, ip);
    
    return {
      ...candidate,
      candidate: resolvedCandidateString,
      address: ip
    };
  }

  /**
   * Clear the resolution cache
   */
  clearCache() {
    this._cache.clear();
  }

  /**
   * Dispose of the resolver and clean up resources
   */
  dispose() {
    this.clearCache();
    
    // Clean up Node.js resolver if running
    if (this._mode === 'node' && this._resolver) {
      try {
        this._resolver.stop();
      } catch (error) {
        console.warn('Error stopping mDNS resolver:', error.message);
      }
    }
    
    this._resolver = null;
    this._initialized = false;
    this._mode = null;
  }
}
