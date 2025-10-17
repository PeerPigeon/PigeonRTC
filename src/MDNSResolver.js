/**
 * mDNS Resolver for handling .local ICE candidates
 * Uses pigeonns for resolving mDNS hostnames to IP addresses
 */
export class MDNSResolver {
  constructor() {
    this._resolver = null;
    this._initialized = false;
    this._cache = new Map();
    this._cacheTimeout = 60000; // 60 seconds cache TTL
  }

  /**
   * Initialize the mDNS resolver
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) {
      return;
    }

    try {
      // Dynamically import pigeonns
      const pigeonnsModule = await import('pigeonns');
      this._resolver = pigeonnsModule.default || pigeonnsModule;
      this._initialized = true;
    } catch (error) {
      console.warn('Failed to initialize mDNS resolver:', error.message);
      // Don't throw - allow fallback to non-mDNS operation
      this._initialized = false;
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
      // Use pigeonns to resolve the hostname
      const ip = await this._resolver.resolve(hostname);
      
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
    this._resolver = null;
    this._initialized = false;
  }
}
