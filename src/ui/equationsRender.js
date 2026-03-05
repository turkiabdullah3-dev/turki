export function renderEquations(equations) {
  equations.forEach((eq) => {
    const element = document.getElementById(eq.id);

    if (!element) return;

    try {
      if (window.katex) {
        window.katex.render(eq.latex, element, {
          throwOnError: false,
          displayMode: true
        });
      } else {
        element.textContent = eq.latex;
        element.style.fontFamily = 'monospace';
      }
    } catch (error) {
      element.textContent = eq.latex;
      element.style.fontFamily = 'monospace';
      console.warn('Equation fallback triggered:', error);
    }
  });
}
