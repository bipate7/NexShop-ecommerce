// js/product.js - single product page behavior (supports ?id=... detail view)

function qs(name) {
  const params = new URLSearchParams(location.search);
  return params.get(name);
}

async function fetchProductById(id) {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Failed to fetch product", e);
    return null;
  }
}

function renderProductDetail(p, container) {
  container.innerHTML = `
    <div class="row product-page">
      <div class="col-md-6">
        <div class="product-main-image">
          <img src="${p.image}" alt="${
    p.title
  }" class="img-fluid product-image">
        </div>
        <div class="product-thumbs d-flex mt-2">${(p.images || [])
          .map(
            (img) =>
              `<img src="${img}" class="thumb img-thumbnail me-2" style="width:72px;height:72px;object-fit:cover;"/>`
          )
          .join("")}
        </div>
      </div>
      <div class="col-md-6">
        <h2>${p.title}</h2>
        <div class="product-price mb-2">${p.priceHTML}</div>
        <div class="product-rating mb-2">Rating: ${p.rating || "N/A"}</div>
        <p class="product-desc">${p.description || ""}</p>
        <div class="d-flex align-items-center mb-3">
          <label class="me-2">Qty</label>
          <div class="input-group qty-selector" style="width:120px;">
            <button class="btn btn-outline-secondary qty-decrease" type="button">-</button>
            <input type="number" class="form-control qty-input" value="1" min="1" />
            <button class="btn btn-outline-secondary qty-increase" type="button">+</button>
          </div>
        </div>
        <div class="mb-3">
          <button class="btn btn-primary add-to-cart" data-product-id="${
            p.id
          }">Add to Cart</button>
          <button class="btn btn-outline-secondary wishlist-toggle ms-2" data-product-id="${
            p.id
          }"><i class="far fa-heart"></i> Wishlist</button>
        </div>
      </div>
    </div>
  `;

  // hook image thumbs
  container.querySelectorAll(".product-thumbs .thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const main = container.querySelector(".product-main-image img");
      main.src = thumb.src;
    });
  });

  // quantity controls
  const dec = container.querySelector(".qty-decrease");
  const inc = container.querySelector(".qty-increase");
  const input = container.querySelector(".qty-input");
  dec.addEventListener(
    "click",
    () => (input.value = Math.max(1, Number(input.value) - 1))
  );
  inc.addEventListener(
    "click",
    () => (input.value = Math.max(1, Number(input.value) + 1))
  );

  // wishlist toggle updates icon state
  const wbtn = container.querySelector(".wishlist-toggle");
  if (wbtn) {
    const id = wbtn.dataset.productId;
    if (window && typeof isWishlisted === "function" && isWishlisted(id)) {
      wbtn.querySelector("i").classList.remove("far");
      wbtn.querySelector("i").classList.add("fas");
    }
    wbtn.addEventListener("click", () => {
      if (typeof toggleWishlist === "function") {
        toggleWishlist(id, wbtn);
      }
    });
  }
}

function ensureProductActionHandlers() {
  // Add-to-cart handler with qty support
  document.body.addEventListener("click", async (e) => {
    const addBtn = e.target.closest(".add-to-cart");
    if (addBtn) {
      const id = addBtn.dataset.productId;
      const card =
        addBtn.closest(".product-page") || addBtn.closest(".product-card");
      const qtyInput = card ? card.querySelector(".qty-input") : null;
      const qty = qtyInput ? Number(qtyInput.value) || 1 : 1;
      // find product title for cart entry
      let title = "Product";
      if (card)
        title =
          card.querySelector(".product-title")?.textContent?.trim() ||
          card.querySelector("h2")?.textContent?.trim() ||
          title;
      // call addToCart if available
      if (typeof addToCart === "function") {
        await addToCart({ id, title, qty });
        // small non-blocking toast
        try {
          showToast && showToast("Added to cart");
        } catch (e) {}
      } else {
        alert(`Added ${qty} × ${title} (demo)`);
      }
    }
  });
}

// Small helper to show a temporary toast message (minimal)
function showToast(msg, timeout = 1700) {
  let t = document.getElementById("nexshop-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "nexshop-toast";
    t.style.position = "fixed";
    t.style.right = "20px";
    t.style.bottom = "20px";
    t.style.padding = "10px 16px";
    t.style.background = "rgba(25,25,25,0.9)";
    t.style.color = "white";
    t.style.borderRadius = "6px";
    t.style.zIndex = 9999;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => {
    t.style.display = "none";
  }, timeout);
}

// init

document.addEventListener("DOMContentLoaded", async () => {
  console.log("product.js loaded");

  ensureProductActionHandlers();

  const id = qs("id");
  if (!id) return; // nothing more to do on listing pages

  const container =
    document.querySelector("main") || document.getElementById("main-content");
  if (!container) return;

  const p = await fetchProductById(id);
  if (!p) {
    container.innerHTML = '<p class="text-muted">Product not found.</p>';
    return;
  }

  // ensure images array exists
  p.images = p.images || (p.image ? [p.image] : []);

  renderProductDetail(p, container);
});
