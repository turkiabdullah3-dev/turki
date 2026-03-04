// Safe storage module - handles sessionStorage and localStorage
// Owner: Turki Abdullah © 2026

export const storage = {
  /**
   * Set session data
   * @param {object} session 
   */
  setSession(session) {
    try {
      sessionStorage.setItem('spacetime_session', JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },
  
  /**
   * Get session data
   * @returns {object|null}
   */
  getSession() {
    try {
      const data = sessionStorage.getItem('spacetime_session');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to read session:', e);
      return null;
    }
  },
  
  /**
   * Clear session
   */
  clearSession() {
    try {
      sessionStorage.removeItem('spacetime_session');
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  },
  
  /**
   * Save user settings (non-sensitive)
   * @param {object} settings 
   */
  saveSettings(settings) {
    try {
      const existing = this.getSettings();
      const merged = { ...existing, ...settings };
      localStorage.setItem('spacetime_settings', JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },
  
  /**
   * Get user settings
   * @returns {object}
   */
  getSettings() {
    try {
      const data = localStorage.getItem('spacetime_settings');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to read settings:', e);
      return {};
    }
  },
  
  /**
   * Get specific setting with default
   * @param {string} key 
   * @param {*} defaultValue 
   * @returns {*}
   */
  getSetting(key, defaultValue) {
    const settings = this.getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }
};

export default storage;
