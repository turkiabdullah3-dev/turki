// Authentication module - Demo access control
// Owner: Turki Abdullah © 2026
// SECURITY NOTE: This is front-end only demo auth, not production-grade security

import CONFIG from './config.js';
import { storage } from './storage.js';

export const auth = {
  /**
   * Attempt login with username
   * @param {string} username 
   * @returns {boolean} success
   */
  login(username) {
    const user = CONFIG.users[username.toLowerCase()];
    
    if (!user) {
      return false;
    }
    
    const session = {
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      loginTime: Date.now()
    };
    
    storage.setSession(session);
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
    return storage.getSession();
  },
  
  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return storage.getSession() !== null;
  },
  
  /**
   * Check if current user is owner
   * @returns {boolean}
   */
  isOwner() {
    const session = storage.getSession();
    return session && session.role === 'owner';
  },
  
  /**
   * Check if current user is guest
   * @returns {boolean}
   */
  isGuest() {
    const session = storage.getSession();
    return session && session.role === 'guest';
  },
  
  /**
   * Require login - redirect if not logged in
   */
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = './login.html';
    }
  },
  
  /**
   * Require owner role - show error if not owner
   */
  requireOwner() {
    if (!this.isOwner()) {
      alert('This action requires owner privileges');
      return false;
    }
    return true;
  }
};

export default auth;
