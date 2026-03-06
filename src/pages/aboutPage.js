// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved
import '../../styles/app.css';
import '../../styles/glass.css';

import auth from '../core/auth.js';

auth.requireLogin();

document.getElementById('btn-home')?.addEventListener('click', () => {
  window.location.href = './home.html';
});
