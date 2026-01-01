// js/homegarden.js - category-specific hooks

document.addEventListener("DOMContentLoaded", async () => {
  console.log("homegarden.js loaded");
  if (typeof renderCategoryProducts === "function")
    await renderCategoryProducts("Home & Garden");
});
