// js/cart.js - client-side cart with backend integration and local fallback

const CART_KEY = "nexshop_cart_v1";
const CART_ID_KEY = "nexshop_cart_id";
const API_BASE = "/api/cart";
let _apiAvailable = null;

async function checkApi() {
  if (_apiAvailable !== null) return _apiAvailable;
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    _apiAvailable = res.ok;
  } catch (e) {
    _apiAvailable = false;
  }
  return _apiAvailable;
}

// localStorage fallback
function local_getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}
function local_saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

async function api_createCart(items = []) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  return res.json();
}
async function api_getCart(cartId) {
  const res = await fetch(`${API_BASE}/${cartId}`);
  return res.ok ? res.json() : null;
}
async function api_addItem(cartId, item) {
  const res = await fetch(`${API_BASE}/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item }),
  });
  return res.json();
}
async function api_deleteItem(cartId, index) {
  const res = await fetch(`${API_BASE}/${cartId}/items/${index}`, {
    method: "DELETE",
  });
  return res.json();
}
async function api_clearCart(cartId) {
  const res = await fetch(`${API_BASE}/${cartId}/clear`, { method: "POST" });
  return res.json();
}

async function getCart() {
  if (await checkApi()) {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return [];
    const r = await api_getCart(cartId);
    return r && r.items ? r.items : [];
  }
  return local_getCart();
}

async function saveCart(cart) {
  if (await checkApi()) {
    let cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      const created = await api_createCart(cart);
      localStorage.setItem(CART_ID_KEY, created.cartId);
      return created.items;
    }
    // replace
    await fetch(`${API_BASE}/${cartId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });
    return cart;
  }
  local_saveCart(cart);
  return cart;
}

async function updateCartCount() {
  const cart = await getCart();
  // count = sum of qty or number of items
  const count = Array.isArray(cart)
    ? cart.reduce((s, i) => s + (Number(i.qty) || 0), 0)
    : 0;
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count;
  });
}

async function renderCartList(containerSelector = "#cart-list") {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const cart = await getCart();
  if (!cart.length) {
    container.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
    return;
  }
  container.innerHTML = "";
  const list = document.createElement("div");
  list.className = "list-group";
  let subtotal = 0;
  cart.forEach((item, idx) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    subtotal += price * qty;
    const row = document.createElement("div");
    row.className = "list-group-item";
    row.innerHTML = `
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <strong>${item.title}</strong>
          <div class="text-muted small">Price: ${
            price ? "₹" + price.toFixed(2) : "N/A"
          }</div>
          <div class="text-muted small">Qty: <input type="number" class="cart-qty" min="1" value="${qty}" data-index="${idx}" style="width:72px;" /></div>
        </div>
        <div>
          <div class="fw-bold">₹${(price * qty).toFixed(2)}</div>
          <button class="btn btn-sm btn-outline-danger mt-2 remove-item" data-index="${idx}">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });

  const footer = document.createElement("div");
  footer.className = "mt-3 d-flex justify-content-between align-items-center";
  footer.innerHTML = `
    <div>
      <strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}
    </div>
    <div>
      <button class="btn btn-sm btn-outline-secondary clear-cart">Clear</button>
      <button class="btn btn-sm btn-primary ms-2 checkout-btn">Checkout</button>
    </div>
  `;

  container.appendChild(list);
  container.appendChild(footer);
}

// add-to-cart handler should try API then fallback to local
async function addToCart(item) {
  // enrich item with price if id present and price missing
  try {
    if (item.id && !item.price) {
      const res = await fetch(`/api/products/${item.id}`);
      if (res.ok) {
        const p = await res.json();
        item.price = p.price || p.priceValue || 0;
        item.title = item.title || p.title;
      }
    }
  } catch (e) {
    // ignore
  }

  if (await checkApi()) {
    let cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      const created = await api_createCart([item]);
      localStorage.setItem(CART_ID_KEY, created.cartId);
      await updateCartCount();
      await renderCartList();
      return created.items;
    }
    await api_addItem(cartId, item);
    await updateCartCount();
    await renderCartList();
    return true;
  }
  // fallback
  const cart = local_getCart();
  // try to merge with existing item by id if present
  if (item.id) {
    const idx = cart.findIndex((c) => c.id === item.id);
    if (idx >= 0) {
      cart[idx].qty = (Number(cart[idx].qty) || 0) + (Number(item.qty) || 1);
    } else {
      cart.push(item);
    }
  } else {
    cart.push(item);
  }
  local_saveCart(cart);
  await updateCartCount();
  await renderCartList();
  return true;
}

async function removeCartItem(index) {
  if (await checkApi()) {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;
    await api_deleteItem(cartId, index);
    await updateCartCount();
    await renderCartList();
    return;
  }
  const cart = local_getCart();
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    local_saveCart(cart);
    await updateCartCount();
    await renderCartList();
  }
}

async function clearCart() {
  if (await checkApi()) {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) return;
    await api_clearCart(cartId);
    await updateCartCount();
    await renderCartList();
    return;
  }
  local_saveCart([]);
  await updateCartCount();
  await renderCartList();
}

async function updateCartItemQty(index, qty) {
  const cart = await getCart();
  if (index >= 0 && index < cart.length) {
    cart[index].qty = qty;
    await saveCart(cart);
    await updateCartCount();
    await renderCartList();
  }
}

// wire up dom

document.addEventListener("DOMContentLoaded", () => {
  console.log("cart.js loaded");
  updateCartCount();
  renderCartList();

  document.body.addEventListener("click", async (e) => {
    if (e.target.closest(".add-to-cart")) {
      const btn = e.target.closest(".add-to-cart");
      const productCard =
        btn.closest(".product-card") || btn.closest(".product-page");
      const titleEl =
        productCard?.querySelector(".product-title") ||
        productCard?.querySelector("h2");
      const title = titleEl ? titleEl.textContent.trim() : "Product";
      const id = btn.dataset.productId || productCard?.dataset.productId;
      const qtyEl = productCard?.querySelector(".qty-input");
      const qty = qtyEl ? Number(qtyEl.value) || 1 : 1;
      await addToCart({ id, title, qty });
      // small notification
      try {
        showToast && showToast("Added to cart");
      } catch (e) {}
    }

    if (e.target.closest(".remove-item")) {
      const idx = Number(e.target.closest(".remove-item").dataset.index);
      await removeCartItem(idx);
    }

    if (e.target.closest(".clear-cart")) {
      if (confirm("Clear your cart?")) await clearCart();
    }

    if (e.target.closest(".checkout-btn")) {
      // simple demo checkout that clears cart
      if (confirm("Proceed to checkout (demo)?")) {
        await clearCart();
        alert("Order placed (demo). Thank you!");
        window.location.href = "index.html";
      }
    }
  });

  // quantity change via input delegate
  document.body.addEventListener("change", async (e) => {
    if (e.target.classList && e.target.classList.contains("cart-qty")) {
      const idx = Number(e.target.dataset.index);
      const qty = Math.max(1, Number(e.target.value) || 1);
      await updateCartItemQty(idx, qty);
    }
  });
});
