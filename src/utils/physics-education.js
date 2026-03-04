document.addEventListener('DOMContentLoaded', () => {
  const quizButtons = document.querySelectorAll('.quiz button, .quiz-btn, .start-quiz');
  quizButtons.forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.add('active');
      setTimeout(() => button.classList.remove('active'), 400);
    });
  });
});
