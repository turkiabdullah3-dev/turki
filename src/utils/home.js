function startExperience() {
  window.location.href = 'src/pages/astronomy.html';
}

function bindExploreButtons() {
  const buttons = document.querySelectorAll('.experience-item .btn-explore');
  const targets = [
    'src/pages/advanced-viz.html',
    'src/pages/immersive.html',
    'src/pages/astronomy.html'
  ];

  buttons.forEach((button, index) => {
    const target = targets[index] || 'src/pages/astronomy.html';
    button.addEventListener('click', () => {
      window.location.href = target;
    });
  });
}

function bindPrimaryActions() {
  const ctaButton = document.querySelector('.cta .btn-primary');
  if (ctaButton) {
    ctaButton.addEventListener('click', () => {
      window.location.href = 'src/pages/social-community.html';
    });
  }
}

window.startExperience = startExperience;

document.addEventListener('DOMContentLoaded', () => {
  bindExploreButtons();
  bindPrimaryActions();
});
