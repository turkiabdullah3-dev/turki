document.addEventListener('DOMContentLoaded', () => {
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});
