// js/fashion.js - category-specific hooks

document.addEventListener("DOMContentLoaded", async () => {
  console.log("fashion.js loaded");
  if (typeof renderCategoryProducts === "function")
    await renderCategoryProducts("Fashion");
});
