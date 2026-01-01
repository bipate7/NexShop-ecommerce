// js/main.js - site-wide JavaScript for NexShop

(function () {
  "use strict";

  // Simple helper: wait for DOM
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    console.log("NexShop main.js loaded");

    // Example: wire up mobile nav toggle
    function bindHeaderInteractions() {
      const navToggle = document.getElementById("nav-toggle");
      const mobileLabel = document.querySelector(".mobile-nav-toggle");
      const mainNav = document.getElementById("main-nav");
      if (navToggle && mobileLabel && mainNav) {
        // Update ARIA attributes when toggled
        function updateNavState() {
          const expanded = !!navToggle.checked;
          mobileLabel.setAttribute(
            "aria-expanded",
            expanded ? "true" : "false"
          );
          mainNav.setAttribute("aria-hidden", expanded ? "false" : "true");
        }
        navToggle.addEventListener("change", updateNavState);
        // Make the mobile nav toggle keyboard-accessible (Enter / Space)
        mobileLabel.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navToggle.checked = !navToggle.checked;
            updateNavState();
          }
        });

        // Close nav on link click (mobile) and if clicking outside while open
        const navLinks = mainNav.querySelectorAll("a");
        navLinks.forEach((a) =>
          a.addEventListener("click", () => {
            if (window.innerWidth <= 992) {
              navToggle.checked = false;
              updateNavState();
            }
          })
        );

        document.addEventListener("click", (ev) => {
          if (window.innerWidth > 992) return; // only for mobile
          const withinHeader =
            ev.target.closest && ev.target.closest(".header-container");
          if (!withinHeader && navToggle.checked) {
            navToggle.checked = false;
            updateNavState();
          }
        });

        updateNavState();
      }

      // Example: basic search handling - dispatch a search event so pages can react
      document
        .querySelectorAll('.search-box input[type="text"]')
        .forEach((input) => {
          // remove any previous handler
          input.removeEventListener("keydown", window._nexshopSearchHandler);
          window._nexshopSearchHandler = function (e) {
            if (e.key === "Enter") {
              e.preventDefault();
              const query = input.value || "";
              // dispatch detail event
              document.dispatchEvent(
                new CustomEvent("nexshop:search", { detail: { query } })
              );
              // if a page-level search function exists, call it
              if (typeof applyFiltersAndRender === "function") {
                window._nexshopQuery = query;
                // allow the products module to pick it up from its own inputs
                const prodInput = document.querySelector(
                  ".products-controls .search-input"
                );
                if (prodInput) prodInput.value = query;
                applyFiltersAndRender();
              }
            }
          };
          input.addEventListener("keydown", window._nexshopSearchHandler);

          // Live input -> dispatch so other modules can react
          input.addEventListener("input", (e) => {
            const query = e.target.value || "";
            document.dispatchEvent(
              new CustomEvent("nexshop:search", { detail: { query } })
            );
          });
        });
    }

    // Bind now
    bindHeaderInteractions();

    // Function to update header user actions based on auth state
    function updateHeaderUser() {
      try {
        const ua = document.querySelector(".user-actions");
        if (!ua) return;
        // read user from localStorage to avoid hard dependency on auth module
        const user = (function () {
          try {
            return JSON.parse(localStorage.getItem("nexshop_user") || "null");
          } catch (e) {
            return null;
          }
        })();
        if (user && user.name) {
          ua.innerHTML = `
            <div class="user-greeting">Hello, <strong>${
              user.name.split(" ")[0]
            }</strong></div>
            <a href="MyAccount.html" class="btn btn-link">My Account</a>
            <button class="btn-logout btn btn-outline-secondary">Logout</button>
            <a href="cart.html" class="cart-icon ms-2" aria-label="View cart"><i class="fas fa-shopping-cart" aria-hidden="true"></i><span class="cart-count" aria-live="polite" aria-atomic="true">0</span></a>
          `;
          const logoutBtn = ua.querySelector(".btn-logout");
          if (logoutBtn)
            logoutBtn.addEventListener("click", () => {
              localStorage.removeItem("nexshop_user");
              updateHeaderUser();
            });
        } else {
          // show default actions
          ua.innerHTML = `
            <a href="Login.html"><button class="btn-primary">Login</button></a>
            <a href="Register.html"><button class="btn-primary">Register</button></a>
            <a href="cart.html" class="cart-icon" aria-label="View cart"><i class="fas fa-shopping-cart" aria-hidden="true"></i><span class="cart-count" aria-live="polite" aria-atomic="true">0</span></a>
          `;
        }
      } catch (e) {
        // ignore
      }
    }

    // Expose a hook so templates can notify us after injection
    window.NexShop = window.NexShop || {};
    window.NexShop.onTemplatesInjected = function () {
      // Re-bind any interactions on the newly injected header/footer
      bindHeaderInteractions();
      // update header user display
      updateHeaderUser();
      // Update cart count (cart.js provides updateCartCount)
      if (typeof updateCartCount === "function") updateCartCount();
      // Set aria-current on nav links to improve accessibility
      try {
        const navLinks = document.querySelectorAll(
          'nav[aria-label="Main navigation"] a'
        );
        const pathname = location.pathname.split("/").pop() || "index.html";
        navLinks.forEach((a) => {
          a.removeAttribute("aria-current");
          const href = a.getAttribute("href");
          if (href && href.includes(pathname))
            a.setAttribute("aria-current", "page");
        });
      } catch (e) {
        // ignore in older browsers
      }
      // Re-bind other page-level behaviors if necessary
    };

    // Automatically inject shared templates if available
    if (typeof window.NexShop.injectShared === "function") {
      window.NexShop.injectShared();
    }

    // expose helper globally so auth module can call it
    window.updateHeaderUser = updateHeaderUser;

    // Performance: add lazy loading to all images that don't specify it
    try {
      document.querySelectorAll("img:not([loading])").forEach((img) => {
        img.setAttribute("loading", "lazy");
      });
    } catch (err) {
      /* defensive: ignore in older browsers */
    }

    // Placeholder functions for future work: injecting header/footer and rendering products
    window.NexShop.injectHeader = function (html) {
      // will be used when extracting header to template
    };

    window.NexShop.injectFooter = function (html) {
      // will be used when extracting footer to template
    };
  });
})();
