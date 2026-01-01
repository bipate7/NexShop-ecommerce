// js/checkout.js - simple checkout demo

document.addEventListener("DOMContentLoaded", () => {
  console.log("checkout.js loaded");
  const form = document.querySelector("form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // In a real site, send data to backend. Here we clear cart and show success.
    localStorage.removeItem("nexshop_cart_v1");
    alert("Order placed (demo).");
    window.location.href = "index.html";
  });
});
