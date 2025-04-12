document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("nav ul");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });
  }

  const signUpButton = document.getElementById('signUpButton');
  const signInButton = document.getElementById('signInButton');
  const signInForm = document.getElementById('signIn');
  const signUpForm = document.getElementById('signup');

  if (signUpButton && signInForm && signUpForm) {
    signUpButton.addEventListener('click', function () {
      signInForm.style.display = "none";
      signUpForm.style.display = "block";
    });
  }

  if (signInButton && signInForm && signUpForm) {
    signInButton.addEventListener('click', function () {
      signInForm.style.display = "block";
      signUpForm.style.display = "none";
    });
  }
});
