document.addEventListener('DOMContentLoaded', () => {
  const mediaButtons = document.querySelectorAll('button, .btn, .control-btn');
  mediaButtons.forEach((button) => {
    if (button.dataset.bound === '1') return;
    button.dataset.bound = '1';
  });
});
