// js/categories.js - behavior for Categories and category pages

function getQueryParam(name) {
  const p = new URLSearchParams(location.search);
  return p.get(name);
}

async function renderCategoryProducts(
  category,
  containerSelector = ".products-container"
) {
  try {
    if (
      typeof fetchProducts !== "function" ||
      typeof renderProducts !== "function"
    )
      return;
    const products = await fetchProducts();
    const filtered = products.filter((p) => {
      if (!category) return true;
      const cat = category.toLowerCase();
      if (p.category && p.category.toLowerCase().includes(cat)) return true;
      if (p.tags && p.tags.join(" ").toLowerCase().includes(cat)) return true;
      if (p.title && p.title.toLowerCase().includes(cat)) return true;
      return false;
    });
    renderProducts(filtered, containerSelector);
    if (typeof updateCartCount === "function") updateCartCount();
  } catch (e) {
    console.error("Failed to render category products", e);
  }
}

// init
document.addEventListener("DOMContentLoaded", async () => {
  console.log("categories.js loaded");

  // Apply category filter based on query param or page title
  const catFromQuery = getQueryParam("cat");
  const catFromDOM = document.querySelector(
    "h1.category-title, h2.category-title"
  );
  const category =
    catFromQuery || (catFromDOM ? catFromDOM.textContent.trim() : "");
  if (category) await renderCategoryProducts(category);

  // Hook category link clicks to navigate with query param
  document.querySelectorAll(".category-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      // if link doesn't already contain cat param, modify it
      try {
        const url = new URL(a.href, location.href);
        url.searchParams.set("cat", a.textContent.trim());
        a.href = url.toString();
      } catch (ex) {}
    });
  });
});
