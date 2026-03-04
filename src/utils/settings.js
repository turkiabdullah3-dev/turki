document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('input, select, textarea');
  const storageKey = 'spacetime-settings';

  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      inputs.forEach((input) => {
        const key = input.id || input.name;
        if (!key || data[key] === undefined) return;
        if (input.type === 'checkbox') input.checked = Boolean(data[key]);
        else input.value = data[key];
      });
    } catch (_) {}
  }

  const persist = () => {
    const data = {};
    inputs.forEach((input) => {
      const key = input.id || input.name;
      if (!key) return;
      data[key] = input.type === 'checkbox' ? input.checked : input.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  inputs.forEach((input) => input.addEventListener('change', persist));
});
