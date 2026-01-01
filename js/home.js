// js/home.js - page-specific logic for index.html

document.addEventListener("DOMContentLoaded", () => {
  console.log("home.js loaded");

  // CTA button example
  const cta = document.querySelector(".hero .cta-button");
  if (cta)
    cta.addEventListener("click", () => {
      window.location.href = "Products.html";
    });

  // basic animate-on-scroll hookup (simple intersection observer)
  const aos = document.querySelectorAll(".animate-on-scroll");
  if ("IntersectionObserver" in window && aos.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        });
      },
      { threshold: 0.15 }
    );
    aos.forEach((el) => obs.observe(el));
  }

  // Render featured products (use existing fetchProducts / renderProducts if available)
  (async function renderFeatured() {
    try {
      if (
        typeof fetchProducts === "function" &&
        typeof renderProducts === "function"
      ) {
        const products = await fetchProducts();
        const featured = Array.isArray(products) ? products.slice(0, 3) : [];
        renderProducts(featured, ".featured-products .products-container");
        if (typeof updateCartCount === "function") updateCartCount();
      } else {
        // fallback: attempt to fetch raw JSON and render simple cards
        const res = await fetch("data/products.json");
        if (!res.ok) return;
        const data = await res.json();
        const featured = data.slice(0, 3);
        const container = document.querySelector(
          ".featured-products .products-container"
        );
        if (container) {
          container.innerHTML = "";
          featured.forEach((p) => {
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-xl-4";
            col.innerHTML = `
              <div class="product-card card">
                <div class="product-img-container">
                  ${
                    p.badge
                      ? `<span class="product-badge">${p.badge}</span>`
                      : ""
                  }
                  <img loading="lazy" src="${p.image}" alt="${
              p.title
            }" class="product-img img-cover">
                </div>
                <div class="card-body">
                  <h5 class="product-title">${p.title}</h5>
                  <div class="product-price">${p.priceHTML}</div>
                  <button type="button" class="add-to-cart"><i class="fas fa-shopping-cart me-2"></i>Add to Cart</button>
                </div>
              </div>
            `;
            container.appendChild(col);
          });
          if (typeof updateCartCount === "function") updateCartCount();
        }
      }
    } catch (err) {
      console.error("Error rendering featured products", err);
    }
  })();

  // Render other home sections: categories, offers, services, testimonials, blog
  (function renderHomeSections() {
    const categories = [
      { title: "Electronics", icon: "fas fa-laptop", href: "Electronics.html" },
      { title: "Fashion", icon: "fas fa-tshirt", href: "Fashion.html" },
      { title: "Home & Garden", icon: "fas fa-couch", href: "HomeGarden.html" },
      {
        title: "Health & Beauty",
        icon: "fas fa-heartbeat",
        href: "HealthBeauty.html",
      },
    ];

    const offers = [
      {
        title: "Summer Collection",
        text: "Up to 40% off on selected items",
        img: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=800&q=80",
      },
      {
        title: "Electronics Sale",
        text: "Latest gadgets with amazing discounts",
        img: "https://images.cnbctv18.com/wp-content/uploads/2022/09/Apple.jpg",
      },
      {
        title: "New Arrivals",
        text: "Be the first to get our newest products",
        img: "https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&w=800&q=80",
      },
    ];

    const services = [
      {
        icon: "fas fa-shipping-fast",
        title: "Free Shipping",
        desc: "Free shipping on all orders over ₹999",
      },
      {
        icon: "fas fa-undo",
        title: "Easy Returns",
        desc: "30-day money back guarantee",
      },
      {
        icon: "fas fa-shield-alt",
        title: "Secure Payment",
        desc: "All transactions are secure and encrypted",
      },
      {
        icon: "fas fa-headset",
        title: "24/7 Support",
        desc: "Dedicated support team for all your needs",
      },
    ];

    const testimonials = [
      {
        text: "I've been shopping with NexShop for over a year now and I'm always impressed with their product quality and customer service.",
        name: "Sarah Johnson",
        role: "Regular Customer",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      },
      {
        text: "The delivery was super fast and the product was exactly as described. I'll definitely be shopping here again soon!",
        name: "Michael Chen",
        role: "First-time Buyer",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        text: "Their customer support team went above and beyond to help me with my order.",
        name: "Emma Rodriguez",
        role: "Loyal Customer",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      },
    ];

    const blogs = [
      {
        date: "April 15, 2025",
        title: "Top Tech Trends to Watch in 2025",
        img: "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=800&q=80",
      },
      {
        date: "Feb 10, 2025",
        title: "Summer Fashion Essentials",
        img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      },
      {
        date: "June 5, 2025",
        title: "Minimalist Home Decor Ideas",
        img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
      },
    ];

    // Render helpers
    const catContainer = document.querySelector(".categories-placeholder");
    if (catContainer) {
      catContainer.innerHTML = categories
        .map(
          (c) => `
        <div class="category-card">
          <i class="${c.icon} category-icon"></i>
          <h3>${c.title}</h3>
          <a href="${c.href}" class="category-link">Shop Now</a>
        </div>
      `
        )
        .join("");
    }

    const offersContainer = document.querySelector(".offers-placeholder");
    if (offersContainer) {
      offersContainer.innerHTML = offers
        .map(
          (o) => `
        <div class="offer-card">
          <img loading="lazy" src="${o.img}" alt="${o.title}" />
          <div class="offer-content">
            <h3>${o.title}</h3>
            <p>${o.text}</p>
            <button type="button" class="cta-button">Shop Now</button>
          </div>
        </div>
      `
        )
        .join("");
    }

    const servicesContainer = document.querySelector(".services-placeholder");
    if (servicesContainer) {
      servicesContainer.innerHTML = services
        .map(
          (s) => `
        <div class="service-card animate-on-scroll">
          <i class="${s.icon} service-icon"></i>
          <h3 class="service-title">${s.title}</h3>
          <p class="service-description">${s.desc}</p>
        </div>
      `
        )
        .join("");
    }

    const testimonialsContainer = document.querySelector(
      ".testimonials-placeholder"
    );
    if (testimonialsContainer) {
      testimonialsContainer.innerHTML = testimonials
        .map(
          (t) => `
        <div class="testimonial-card">
          <div class="testimonial-text"><p>"${t.text}"</p></div>
          <div class="testimonial-author">
            <div class="author-avatar"><img loading="lazy" src="${t.avatar}" alt="${t.name}"/></div>
            <div class="author-details"><h4>${t.name}</h4><p>${t.role}</p></div>
          </div>
        </div>
      `
        )
        .join("");
    }

    const blogContainer = document.querySelector(".blog-placeholder");
    if (blogContainer) {
      blogContainer.innerHTML = blogs
        .map(
          (b) => `
        <div class="blog-card animate-on-scroll">
          <img loading="lazy" src="${b.img}" alt="${b.title}" class="blog-image" />
          <div class="blog-content">
            <div class="blog-date">${b.date}</div>
            <h3 class="blog-title">${b.title}</h3>
            <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
      `
        )
        .join("");
    }
  })();
});
