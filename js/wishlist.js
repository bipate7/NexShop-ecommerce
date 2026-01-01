// js/wishlist.js - renders wishlist saved in localStorage

async function fetchProduct(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

async function renderWishlist(containerSelector = ".wishlist-container") {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const list = JSON.parse(localStorage.getItem("nexshop_wishlist_v1") || "[]");
  if (!list.length) {
    container.innerHTML = '<p class="text-muted">Your wishlist is empty.</p>';
    return;
  }
  container.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "row g-3";
  for (const id of list) {
    const p = await fetchProduct(id);
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-xl-4";
    col.innerHTML = p
      ? `
      <div class="card product-card" data-product-id="${p.id}">
        <div class="product-img-container">
          <img src="${p.image}" class="img-cover" alt="${p.title}" />
        </div>
        <div class="card-body">
          <h5>${p.title}</h5>
          <div>${p.priceHTML}</div>
          <div class="mt-2">
            <button class="btn btn-sm btn-primary add-to-cart" data-product-id="${p.id}">Add to Cart</button>
            <button class="btn btn-sm btn-outline-danger remove-wishlist ms-2" data-id="${p.id}">Remove</button>
          </div>
        </div>
      </div>
    `
      : `
      <div class="card"><div class="card-body">Missing product (${id}) <button class="btn btn-sm btn-outline-danger remove-wishlist" data-id="${id}">Remove</button></div></div>
    `;
    grid.appendChild(col);
  }
  container.appendChild(grid);
}

function removeFromWishlist(id) {
  const list = JSON.parse(localStorage.getItem("nexshop_wishlist_v1") || "[]");
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem("nexshop_wishlist_v1", JSON.stringify(list));
  }
}

// Wire up page

document.addEventListener("DOMContentLoaded", () => {
  renderWishlist();

  document.body.addEventListener("click", async (e) => {
    if (e.target.closest(".remove-wishlist")) {
      const id = e.target.closest(".remove-wishlist").dataset.id;
      removeFromWishlist(id);
      await renderWishlist();
    }
  });
});
