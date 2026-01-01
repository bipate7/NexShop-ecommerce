// js/electronics.js - category-specific hooks

document.addEventListener("DOMContentLoaded", async () => {
  console.log("electronics.js loaded");
  if (typeof renderCategoryProducts === "function")
    await renderCategoryProducts("Electronics");
});
