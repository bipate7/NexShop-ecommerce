// js/products.js - listing page logic (Products.html)

const WISHLIST_KEY = "nexshop_wishlist_v1";
let _allProducts = [];
let _filteredProducts = [];
let _currentPage = 1;
const PAGE_SIZE = 9;
let _currentQuery = "";
let _currentSort = ""; // e.g., 'price-asc', 'price-desc', 'rating-desc'

async function fetchProducts() {
  // Try backend API first, then fallback to bundled `data/products.json`
  try {
    const res = await fetch("/api/products");
    if (res.ok) return res.json();
    console.warn(
      "/api/products returned non-OK status, falling back to local data"
    );
  } catch (err) {
    console.warn("API fetch failed, falling back to local data", err);
  }

  try {
    const res2 = await fetch("data/products.json");
    if (res2.ok) return res2.json();
  } catch (err) {
    console.error("Fallback fetch for data/products.json failed", err);
  }

  return [];
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

function isWishlisted(id) {
  return getWishlist().includes(id);
}

function toggleWishlist(id, buttonEl) {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
  saveWishlist(list);
  updateWishlistButtons();
}

function updateWishlistButtons(containerSelector = ".products-container") {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.querySelectorAll(".product-card").forEach((card) => {
    const id = card.dataset.productId;
    const btn = card.querySelector(".wishlist-btn i");
    if (!id || !btn) return;
    if (isWishlisted(id)) {
      btn.classList.remove("far");
      btn.classList.add("fas");
      btn.style.color = "var(--accent)";
    } else {
      btn.classList.remove("fas");
      btn.classList.add("far");
      btn.style.color = "";
    }
  });
}

function renderProducts(products, containerSelector = ".products-container") {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = "";
  products.forEach((p) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-xl-4";
    col.innerHTML = `
      <div class="product-card card" data-product-id="${p.id}">
        <div class="product-img-container">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
          <img loading="lazy" src="${p.image}" alt="${
      p.title
    }" class="product-img img-cover">
          <button type="button" class="wishlist-btn" aria-label="Toggle wishlist"><i class="${
            isWishlisted(p.id) ? "fas" : "far"
          } fa-heart" aria-hidden="true"></i></button>
        </div>
        <div class="card-body">
          <h5 class="product-title">${p.title}</h5>
          <div class="product-rating">${
            p.rating ? p.rating.toFixed(1) : ""
          }</div>
          <div class="product-price">${p.priceHTML}</div>
          <button type="button" class="add-to-cart" data-product-id="${
            p.id
          }"><i class="fas fa-shopping-cart me-2"></i>Add to Cart</button>
          <a class="btn btn-link view-product" href="Product2.html?id=${
            p.id
          }">View</a>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
  updateWishlistButtons(containerSelector);
}

function applyFiltersAndRender() {
  let items = Array.isArray(_allProducts) ? [..._allProducts] : [];
  // search
  if (_currentQuery && _currentQuery.trim()) {
    const q = _currentQuery.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.tags && p.tags.join(" ").toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }
  // sort
  if (_currentSort === "price-asc") items.sort((a, b) => a.price - b.price);
  if (_currentSort === "price-desc") items.sort((a, b) => b.price - a.price);
  if (_currentSort === "rating-desc")
    items.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  _filteredProducts = items;
  // pagination
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (_currentPage > totalPages) _currentPage = totalPages;
  const start = (_currentPage - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  renderProducts(pageItems);
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.querySelector(".products-pagination");
  if (!container) return;
  container.innerHTML = "";
  const nav = document.createElement("nav");
  nav.className = "pagination";
  const ul = document.createElement("ul");
  ul.className = "pagination-list";
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === _currentPage ? "active" : ""}`;
    const a = document.createElement("a");
    a.href = "#";
    a.dataset.page = i;
    a.className = "page-link";
    a.textContent = i;
    li.appendChild(a);
    ul.appendChild(li);
  }
  nav.appendChild(ul);
  container.appendChild(nav);
}

function setupSearchAndSort() {
  // Hook header search
  document
    .querySelectorAll('.search-box input[type="text"]')
    .forEach((input) => {
      input.addEventListener("input", (e) => {
        _currentQuery = e.target.value;
        _currentPage = 1;
        applyFiltersAndRender();
      });
    });

  // create or hook sort select
  let sortSelect = document.querySelector(".products-sort");
  if (!sortSelect) {
    sortSelect = document.createElement("select");
    sortSelect.className = "products-sort form-select form-select-sm";
    sortSelect.innerHTML = `
      <option value="">Sort</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating-desc">Rating</option>
    `;
    const controls = document.querySelector(".products-controls");
    if (controls) controls.appendChild(sortSelect);
  }
  sortSelect.addEventListener("change", (e) => {
    _currentSort = e.target.value;
    applyFiltersAndRender();
  });

  // Listen for global search events dispatched by the header
  document.addEventListener("nexshop:search", (ev) => {
    _currentQuery = (ev && ev.detail && ev.detail.query) || "";
    // reflect into header inputs and local controls
    document
      .querySelectorAll('.search-box input[type="text"]')
      .forEach((i) => (i.value = _currentQuery));
    _currentPage = 1;
    applyFiltersAndRender();
  });
}

// wire up pagination clicks and wishlist/add-to-cart via delegation
function setupDelegation() {
  document.body.addEventListener("click", (e) => {
    const pageLink = e.target.closest(".page-link");
    if (pageLink && pageLink.dataset.page) {
      e.preventDefault();
      _currentPage = Number(pageLink.dataset.page);
      applyFiltersAndRender();
      return;
    }

    const wishlistBtn = e.target.closest(".wishlist-btn");
    if (wishlistBtn) {
      const card = wishlistBtn.closest(".product-card");
      const id = card && card.dataset.productId;
      if (id) toggleWishlist(id, wishlistBtn);
      return;
    }

    // view product - let navigation happen
  });
}

// init

document.addEventListener("DOMContentLoaded", async () => {
  console.log("products.js loaded");
  _allProducts = await fetchProducts();

  setupSearchAndSort();
  setupDelegation();

  // initial render
  _currentPage = 1;
  applyFiltersAndRender();

  // cleanup leftover static product HTML between the container and the pagination nav
  (function cleanupOldStatic(containerSelector = ".products-container") {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    let node = container.nextElementSibling;
    while (node) {
      const isPagination =
        (node.tagName === "NAV" &&
          node.querySelector &&
          node.querySelector(".pagination")) ||
        (node.classList && node.classList.contains("pagination")) ||
        (node.querySelector && node.querySelector(".pagination"));
      if (isPagination) break;
      const next = node.nextElementSibling;
      node.remove();
      node = next;
    }
  })();

  // make sure cart count updates if cart.js is present
  if (typeof updateCartCount === "function") updateCartCount();

  // add-to-cart handled by js/cart.js (listens for .add-to-cart)
});
