// js/healthbeauty.js - category-specific hooks

document.addEventListener("DOMContentLoaded", async () => {
  console.log("healthbeauty.js loaded");
  if (typeof renderCategoryProducts === "function")
    await renderCategoryProducts("Health & Beauty");
});
