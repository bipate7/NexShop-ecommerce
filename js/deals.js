// js/deals.js - populate Flash Sales in Deals.html

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const products = await fetchProducts();
    // Prefer explicitly badged items (Sale, Hot, Trending, New). Fallback to top items.
    let flash = products.filter((p) => p.badge && p.badge.length > 0);
    if (!flash || flash.length === 0) flash = products.slice(0, 8);

    // Render into the flash sales container
    renderProducts(flash, ".flash-sales .products-container");

    // update cart count if cart.js is loaded
    if (typeof updateCartCount === "function") updateCartCount();
  } catch (err) {
    console.error("deals.js error:", err);
  }
});
