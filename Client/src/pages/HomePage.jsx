import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import "../style/HomePage.css";

// ── Your Exact Original Data ─────────────────────────────────
const sliderData = [
  {
    bgImage: "https://domf5oio6qrcr.cloudfront.net/medialibrary/11499/3b360279-8b43-40f3-9b11-604749128187.jpg",
    title:   "Fresh Vegetables at 50% OFF",
    slogan:  "Quality you can taste, prices you'll love.",
  },
  {
    bgImage: "https://centerforfamilymedicine.com/wp-content/uploads/2020/06/Center-for-family-medicine-The-Health-Benefits-of-Eating-10-Servings-Of-Fruits-_-Veggies-Per-Day.jpg",
    title:   "Instant Delivery on All Orders",
    slogan:  "From our store to your door in minutes.",
  },
  {
    bgImage: "https://media.istockphoto.com/id/1449032425/photo/shopping-bag-full-of-healthy-food-on-blue.jpg?s=612x612&w=0&k=20&c=856XpqRgq8Bj9Mr28VzAdW-iTyHEj_dW01m6SPPHsOU=",
    title:   "Save Big on Monthly Groceries",
    slogan:  "Plan your month, save your money.",
  },
];

const homeCategories = [
  { name: "Fruits & Veggies",      icon: "🍎" },
  { name: "Dairy & Bread",         icon: "🍞" },
  { name: "Snacks & Munchies",      icon: "🍿" },
  { name: "Cold Drinks & Juices",   icon: "🥤" },
  { name: "Breakfast & Cereal",     icon: "🥣" },
  { name: "Cleaning Essentials",    icon: "🧼" },
];

const discounts = [
  { icon: "💳", title: "Bank Offers",       description: "Up to 20% instant discount on HDFC, ICICI, and SBI cards." },
  { icon: "🎉", title: "New User Special",  description: "Get flat ₹100 off on your first order above ₹599." },
  { icon: "📦", title: "Bulk Savings",      description: "Save more on monthly essentials when you buy in bulk." },
];

const valueProps = [
  { icon: "⚡️", title: "Lightning Fast Delivery", description: "Get your order delivered in as little as 10 minutes." },
  { icon: "💯", title: "Best Quality Guaranteed",  description: "Handpicked and fresh products delivered to you every time." },
  { icon: "💸", title: "Unbeatable Prices",        description: "Enjoy great discounts and offers on a wide range of products." },
];

// ─────────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const { addToCart }       = useCart();
  const { products }        = useProducts(); // ← live from DB
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();
  const [loginMessage, setLoginMessage] = useState(null);

  // ── Show first 6 in-stock products as "featured" ────────────────────────
  const featuredProducts = products
    .filter((p) => (p.stock ?? 1) > 0)
    .slice(0, 6)
    .map((p) => ({ ...p, id: p._id || p.id }));

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((p) => (p + 1) % sliderData.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setLoginMessage(location.state.message);
      const t = setTimeout(() => setLoginMessage(null), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(t);
    }
  }, [location]);

  return (
    <div className="home-page-container">
      {/* Toast Notification */}
      {loginMessage && (
        <div className="toast-message slide-in">
          <span>✅</span> {loginMessage}
        </div>
      )}

      <main>
        {/* --- Hero Slider --- */}
        <section className="hero-slider">
          <div className="slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {sliderData.map((slide, i) => (
              <div key={i} className="slide" style={{ backgroundImage: `url(${slide.bgImage})` }}>
                <div className="slide-overlay"></div>
                <div className="slide-content">
                  <h1 className="slide-title">{slide.title}</h1>
                  <p className="slide-slogan">{slide.slogan}</p>
                  <Link to="/products" className="btn-primary btn-large">Shop Now</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="slider-nav">
            {sliderData.map((_, i) => (
              <button 
                key={i} 
                className={`slider-dot ${i === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
        </section>

        {/* --- Categories --- */}
        <section className="home-section light-bg">
          <div className="section-container">
            <h2 className="section-heading">Shop by Category</h2>
            <div className="category-grid">
              {homeCategories.map((cat, i) => (
                <Link key={i} to="/products" state={{ selectedCategory: cat.name }} className="category-card">
                  <span className="category-icon">{cat.icon}</span>
                  <h3 className="category-name">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- Featured Products --- */}
        <section className="home-section">
          <div className="section-container">
            <h2 className="section-heading">Featured Products</h2>
            {featuredProducts.length === 0 ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading products…</p>
              </div>
            ) : (
              <div className="product-grid">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="pro-product-card">
                    <div className="product-image-wrapper">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }}
                      />
                    </div>
                    <div className="product-details">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-weight">{product.quantity}</p>
                      <div className="product-action-row">
                        <span className="product-price">₹{product.price}</span>
                        <button className="btn-primary btn-small" onClick={() => addToCart(product)}>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="view-all-wrapper">
              <Link to="/products" className="btn-secondary">View All Products →</Link>
            </div>
          </div>
        </section>

        {/* --- Discounts & Offers --- */}
        <section className="home-section teal-bg">
          <div className="section-container">
            <h2 className="section-heading text-white">Discounts & Offers</h2>
            <div className="discounts-grid">
              {discounts.map((d, i) => (
                <div key={i} className="discount-pro-card">
                  <div className="discount-icon-pro">{d.icon}</div>
                  <div className="discount-info">
                    <h4 className="discount-title">{d.title}</h4>
                    <p className="discount-desc">{d.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- About Preview --- */}
        <section className="home-section light-bg about-preview-section">
          <div className="section-container">
            <div className="about-preview-grid">
              <div className="about-preview-text">
                <h2 className="section-heading text-left">About ZYAGRA</h2>
                <p>
                  Welcome to ZYAGRA, your new favorite online grocery store! Born
                  in the heart of Ghaziabad, we are on a mission to revolutionize
                  your grocery shopping experience. We believe in providing the
                  freshest produce, the widest variety of daily essentials, and
                  lightning-fast delivery, all at the click of a button.
                </p>
                <p>Our promise is simple: quality, speed, and unbeatable value.</p>
              </div>
              <div className="about-preview-image-wrapper">
                <img 
                  src="/pictures/home page/promise.jpg" 
                  alt="About ZYAGRA" 
                  className="about-preview-image" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- Value Propositions --- */}
        <section className="home-section">
          <div className="section-container">
            <h2 className="section-heading">Why Choose ZYAGRA?</h2>
            <div className="value-props-grid">
              {valueProps.map((p, i) => (
                <div key={i} className="value-card">
                  <div className="value-icon-wrapper">{p.icon}</div>
                  <h3 className="value-title">{p.title}</h3>
                  <p className="value-desc">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;