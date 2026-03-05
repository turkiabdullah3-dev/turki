// Authentication module - Demo access control
// Owner: Turki Abdullah © 2026
// SECURITY NOTE: This is front-end only demo auth, not production-grade security

import CONFIG from './config.js';
import AUTH_SECRETS from './authSecrets.js';
import { storage } from './storage.js';

const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const LOCKOUT_KEY = 'spacetime_login_lockout';

function safeNow() {
  return Date.now();
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(value || ''));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

function getExpectedHashForRole(role) {
  if (role === 'owner') {
    return AUTH_SECRETS.ownerPassHash;
  }
  if (role === 'guest') {
    return AUTH_SECRETS.guestPassHash;
  }
  return null;
}

function constantTimeEqual(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function createToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function readLockState() {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) {
      return { failCount: 0, lockUntil: 0 };
    }

    const parsed = JSON.parse(raw);
    return {
      failCount: Number(parsed.failCount) || 0,
      lockUntil: Number(parsed.lockUntil) || 0
    };
  } catch {
    return { failCount: 0, lockUntil: 0 };
  }
}

function writeLockState(state) {
  try {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage failures on restricted browsers
  }
}

function getBackoffDurationMs(failCount) {
  if (failCount === 5) {
    return 60_000;
  }
  if (failCount === 6) {
    return 120_000;
  }
  if (failCount >= 7) {
    return 300_000;
  }
  return 0;
}

function isSessionExpired(session) {
  if (!session || !session.expiresAt) {
    return true;
  }
  return safeNow() >= Number(session.expiresAt);
}

export const auth = {
  /**
   * Attempt login with username + access code hash
   * @param {string} username
   * @param {string} accessCode
   * @returns {boolean} success
   */
  async login(username, accessCode) {
    const normalizedUsername = normalizeUsername(username);
    const user = CONFIG.users[normalizedUsername];
    if (!user) {
      return false;
    }

    const expectedHash = getExpectedHashForRole(user.role);
    if (!expectedHash) {
      return false;
    }

    const providedHash = await sha256Hex(accessCode);
    if (!constantTimeEqual(providedHash, expectedHash)) {
      return false;
    }

    const issuedAt = safeNow();
    const session = {
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      issuedAt,
      expiresAt: issuedAt + SESSION_TTL_MS,
      token: createToken()
    };

    storage.setSession(session);
    this.applyRoleRestrictions();
    return true;
  },
  
  /**
   * Logout current user
   */
  logout() {
    storage.clearSession();
    window.location.href = './login.html';
  },
  
  /**
   * Get current session
   * @returns {object|null}
   */
  getSession() {
    const session = storage.getSession();
    if (!session) {
      return null;
    }

    if (isSessionExpired(session)) {
      storage.clearSession();
      return null;
    }

    return session;
  },
  
  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.getSession() !== null;
  },
  
  /**
   * Check if current user is owner
   * @returns {boolean}
   */
  isOwner() {
    const session = this.getSession();
    return session && session.role === 'owner';
  },
  
  /**
   * Check if current user is guest
   * @returns {boolean}
   */
  isGuest() {
    const session = this.getSession();
    return session && session.role === 'guest';
  },
  
  /**
   * Require login - redirect if not logged in
   */
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = './login.html';
      return false;
    }
    this.applyRoleRestrictions();
    return true;
  },
  
  /**
   * Require owner role - show error if not owner
   */
  requireOwner() {
    if (!this.isOwner()) {
      alert('Access denied.');
      return false;
    }
    return true;
  },

  getLoginLockState() {
    const state = readLockState();
    const now = safeNow();
    const remainingMs = Math.max(0, state.lockUntil - now);
    return {
      failCount: state.failCount,
      lockUntil: state.lockUntil,
      isLocked: remainingMs > 0,
      remainingMs,
      remainingSeconds: Math.ceil(remainingMs / 1000)
    };
  },

  recordFailedLoginAttempt() {
    const state = readLockState();
    const failCount = state.failCount + 1;
    const backoffMs = getBackoffDurationMs(failCount);
    const nextState = {
      failCount,
      lockUntil: backoffMs > 0 ? safeNow() + backoffMs : state.lockUntil
    };
    writeLockState(nextState);
    return this.getLoginLockState();
  },

  resetLoginLockState() {
    writeLockState({ failCount: 0, lockUntil: 0 });
  },

  applyRoleRestrictions() {
    if (!this.isGuest()) {
      return;
    }

    document.querySelectorAll('[data-owner-only]').forEach((element) => {
      element.setAttribute('hidden', 'hidden');
      element.setAttribute('aria-hidden', 'true');
      element.setAttribute('disabled', 'disabled');
    });
  },

  guardOwnerAction() {
    if (this.isOwner()) {
      return true;
    }
    alert('Access denied.');
    return false;
  }
};

export default auth;
