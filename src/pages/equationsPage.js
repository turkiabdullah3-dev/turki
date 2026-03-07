// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved
import '../../styles/app.css';
import '../../styles/glass.css';

import auth from '../core/auth.js';
import { equations } from '../ui/equationsData.js';
import { renderEquations } from '../ui/equationsRender.js';
import navigationHelper from '../ui/navigationHelper.js';

auth.requireLogin();

document.addEventListener('DOMContentLoaded', () => {
  renderEquations(equations);

  document.querySelectorAll('[data-tab]').forEach((tab) => {
    tab.addEventListener('click', (event) => {
      const tabName = event.target.dataset.tab;

      document.querySelectorAll('[data-tab]').forEach((tabButton) => {
        tabButton.classList.remove('primary');
      });
      event.target.classList.add('primary');

      document.querySelectorAll('[data-tab-content]').forEach((content) => {
        content.style.display = content.dataset.tabContent === tabName ? 'block' : 'none';
      });
    });
  });

  document.querySelector('[data-tab="blackhole"]')?.classList.add('primary');
});

document.getElementById('btn-home')?.addEventListener('click', () => {
  navigationHelper.navigateWithTransition('./home.html');
});

// Setup page load fade-in transition
navigationHelper.setupPageLoadFadeIn();
