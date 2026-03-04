document.addEventListener('DOMContentLoaded', () => {
  const filters = document.querySelectorAll('[data-filter], .filter-btn');
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
    });
  });
});
