// Equations UI - displays formulas with KaTeX
// Owner: Turki Abdullah © 2026

import { sanitize } from '../core/sanitize.js';

export class EquationsUI {
  constructor() {
    this.currentTab = 'blackhole';
    this.katexLoaded = false;
  }
  
  /**
   * Initialize equations UI
   */
  async init() {
    // Check if KaTeX is loaded
    this.katexLoaded = typeof window.katex !== 'undefined';
    
    if (!this.katexLoaded) {
      console.error('KaTeX not loaded');
      return;
    }
    
    // Setup tabs
    this.setupTabs();
    
    // Show default tab
    this.showTab('blackhole');
  }
  
  /**
   * Setup tab navigation
   */
  setupTabs() {
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.showTab(tabName);
      });
    });
  }
  
  /**
   * Show specific tab
   */
  showTab(tabName) {
    this.currentTab = tabName;
    
    // Update active tab button
    document.querySelectorAll('[data-tab]').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Show corresponding content
    document.querySelectorAll('[data-tab-content]').forEach(content => {
      if (content.dataset.tabContent === tabName) {
        content.style.display = 'block';
      } else {
        content.style.display = 'none';
      }
    });
  }
  
  /**
   * Render LaTeX equation
   */
  renderEquation(elementId, latex, displayMode = true) {
    const element = document.getElementById(elementId);
    if (!element || !this.katexLoaded) return;
    
    try {
      window.katex.render(latex, element, {
        displayMode: displayMode,
        throwOnError: false,
        trust: false
      });
    } catch (e) {
      console.error('KaTeX render error:', e);
      element.textContent = latex;
    }
  }
  
  /**
   * Create equation card
   */
  createEquationCard(title, latex, symbols, explanation, mapping, isExact = true) {
    const card = document.createElement('div');
    card.className = 'equation-card glass-panel';
    
    // Title
    const titleEl = document.createElement('h3');
    sanitize.setText(titleEl, title);
    card.appendChild(titleEl);
    
    // Badge
    const badge = document.createElement('span');
    badge.className = isExact ? 'badge exact' : 'badge approx';
    sanitize.setText(badge, isExact ? 'Exact' : 'Approximate');
    card.appendChild(badge);
    
    // Formula
    const formula = document.createElement('div');
    formula.className = 'equation-formula';
    card.appendChild(formula);
    
    if (this.katexLoaded) {
      try {
        window.katex.render(latex, formula, {
          displayMode: true,
          throwOnError: false
        });
      } catch (e) {
        formula.textContent = latex;
      }
    } else {
      formula.textContent = latex;
    }
    
    // Symbols
    if (symbols) {
      const symbolsEl = document.createElement('div');
      symbolsEl.className = 'glass-text';
      symbolsEl.style.marginTop = '12px';
      sanitize.setText(symbolsEl, 'Where: ' + symbols);
      card.appendChild(symbolsEl);
    }
    
    // Explanation
    if (explanation) {
      const explainEl = document.createElement('div');
      explainEl.className = 'equation-explain';
      
      const label = document.createElement('div');
      label.className = 'glass-label';
      sanitize.setText(label, 'Explain like I\'m 10:');
      explainEl.appendChild(label);
      
      const text = document.createElement('p');
      text.className = 'glass-text';
      sanitize.setText(text, explanation);
      explainEl.appendChild(text);
      
      card.appendChild(explainEl);
    }
    
    // Mapping
    if (mapping) {
      const mapEl = document.createElement('div');
      mapEl.className = 'equation-explain';
      
      const label = document.createElement('div');
      label.className = 'glass-label';
      sanitize.setText(label, 'What you see:');
      mapEl.appendChild(label);
      
      const text = document.createElement('p');
      text.className = 'glass-text';
      sanitize.setText(text, mapping);
      mapEl.appendChild(text);
      
      card.appendChild(mapEl);
    }
    
    return card;
  }
}

export default EquationsUI;
