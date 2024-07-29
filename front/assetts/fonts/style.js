document.addEventListener('DOMContentLoaded', () => {
  // Check the current theme in localStorage
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.querySelector('nav').classList.add('dark-mode');
    document.querySelector('label').classList.add('dark-mode');
    document.getElementById('darkmode-toggle').checked = true;
  }

  // Handle the dark mode toggle
  const darkModeToggle = document.getElementById('darkmode-toggle');
  darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  });

  function enableDarkMode() {
    document.body.classList.add('dark-mode');
    document.querySelector('nav').classList.add('dark-mode');
    document.querySelector('label').classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  }

  function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    document.querySelector('nav').classList.remove('dark-mode');
    document.querySelector('label').classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
});







