// js/templates.js - utilities for inserting shared header/footer (placeholders)

window.NexShop = window.NexShop || {};
window.NexShop.templates = {
  header: function () {
    return `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <div class="header-container">
        <input type="checkbox" id="nav-toggle" hidden aria-hidden="false">
        
        <div class="logo">
            <div class="logo-icon"></div>
            <div class="logo-text">NexShop</div>
        </div>
        
        <div class="header-actions">
            <div class="search-box">
                <input class="search-input" type="text" aria-label="Search products" placeholder="Search products...">
                <i class="fas fa-search"></i>
            </div>
            <div class="user-actions">
                <a href="Login.html"><button class="btn-primary">Login</button></a>
                <a href="Register.html"><button class="btn-primary">Register</button></a>
                <a href="cart.html" class="cart-icon" aria-label="View cart"><i class="fas fa-shopping-cart" aria-hidden="true"></i><span class="cart-count" aria-live="polite" aria-atomic="true">0</span></a>
            </div>

            <label for="nav-toggle" class="mobile-nav-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation" tabindex="0" role="button">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </label>
        </div>
        
        <nav role="navigation" aria-label="Main navigation">
            <ul id="main-nav" aria-hidden="true">
                <li><a href="index.html">Home</a></li>
                <li><a href="Products.html">Products</a></li>
                <li><a href="Categories.html">Categories</a></li>
                <li><a href="Deals.html">Deals</a></li>
                <li><a href="About.html">About</a></li>
                <li><a href="Contact.html">Contact</a></li>
            </ul>
        </nav>
        
        <div class="mobile-search">
            <div class="search-box">
                <input type="text" placeholder="Search products...">
                <i class="fas fa-search"></i>
            </div>
        </div>
        
        <div class="mobile-user-actions">
            <a href="Login.html"><button>Login</button></a>
            <a href="Register.html"><button>Register</button></a>
        </div>

    </div>`;
  },
  footer: function () {
    return `
    <div class="footer-container">
        <div class="footer-column">
            <h3>NexShop</h3>
            <p>Your one-stop destination for all your shopping needs. We offer quality products at affordable prices with excellent customer service.</p>
            <div class="social-icons">
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
                <a href="#"><i class="fab fa-pinterest"></i></a>
                <a href="#"><i class="fab fa-youtube"></i></a>
            </div>
        </div>
        <div class="footer-column">
            <h3>Quick Links</h3>
            <ul class="footer-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="Products.html">Products</a></li>
                <li><a href="Categories.html">Categories</a></li>
                <li><a href="About.html">About Us</a></li>
                <li><a href="Contact.html">Contact</a></li>
            </ul>
        </div>
        <div class="footer-column">
            <h3>Customer Service</h3>
            <ul class="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Shipping & Returns</a></li>
                <li><a href="#">Order Tracking</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
            </ul>
        </div>
        <div class="footer-column">
            <h3>Contact Info</h3>
            <ul class="footer-links">
                <li><i class="fas fa-map-marker-alt"></i> 8, Yashoda Nagar, Jaitala Road, Nagpur</li>
                <li><i class="fas fa-phone"></i> +91-9876543210</li>
                <li><i class="fas fa-envelope"></i> support@nexshop.com</li>
                <li><i class="fas fa-clock"></i> Mon-Fri: 9AM-6PM</li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <p>&copy; 2025 NexShop. All Rights Reserved. | Designed with <i class="fas fa-heart" style="color: var(--secondary);"></i></p>
    </div>`;
  },
};

// Inject header/footer into the page and notify the app
window.NexShop.injectShared = function () {
  // support multiple placeholder patterns used by pages (semantic tags or id-based placeholders)
  const headerEl =
    document.querySelector("header") ||
    document.querySelector("#site-header") ||
    document.querySelector(".site-header");
  const footerEl =
    document.querySelector("footer") ||
    document.querySelector("#site-footer") ||
    document.querySelector(".site-footer");

  if (headerEl) headerEl.innerHTML = window.NexShop.templates.header();
  if (footerEl) footerEl.innerHTML = window.NexShop.templates.footer();

  // Notify other modules that injection completed
  if (typeof window.NexShop.onTemplatesInjected === "function") {
    window.NexShop.onTemplatesInjected();
  }
};
