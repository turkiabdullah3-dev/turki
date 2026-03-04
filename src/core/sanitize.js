// Sanitization utilities - prevent XSS attacks
// Owner: Turki Abdullah © 2026

export const sanitize = {
  /**
   * Safely set text content (prevents XSS)
   * NEVER use innerHTML for user data - always use this
   * @param {HTMLElement} element 
   * @param {string} text 
   */
  setText(element, text) {
    if (!element) return;
    element.textContent = String(text);
  },
  
  /**
   * Sanitize string for safe display
   * @param {string} str 
   * @returns {string}
   */
  text(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  
  /**
   * Sanitize for use in HTML attributes
   * @param {string} str 
   * @returns {string}
   */
  attribute(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },
  
  /**
   * Create safe text node
   * @param {string} text 
   * @returns {Text}
   */
  createTextNode(text) {
    return document.createTextNode(String(text));
  }
};

export default sanitize;
