// js/contact.js - contact page behavior (form validation stub)

document.addEventListener("DOMContentLoaded", () => {
  console.log("contact.js loaded");
  const form = document.querySelector("form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thanks! Your message has been received (demo).");
    form.reset();
  });
});
