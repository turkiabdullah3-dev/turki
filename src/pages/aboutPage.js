// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved
import '../../styles/app.css';
import '../../styles/glass.css';

import auth from '../core/auth.js';
import navigationHelper from '../ui/navigationHelper.js';

auth.requireLogin();

document.getElementById('btn-home')?.addEventListener('click', () => {
  navigationHelper.navigateWithTransition('./home.html');
});

// Setup page load fade-in transition
navigationHelper.setupPageLoadFadeIn();
