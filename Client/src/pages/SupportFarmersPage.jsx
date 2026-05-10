import React from "react";
import "../style/SupportFarmersPage.css"; 

const campaigns = [
  {
    title: "Kisan Tech Melas",
    date: "Monthly Events",
    description: "Interactive workshops where we provide rural farmers with digital literacy training, helping them use the ZYAGRA platform to track market rates and optimize yields.",
    image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Project Harit (Green)",
    date: "Ongoing Initiative",
    description: "Subsidizing drip irrigation systems and organic seeds for our partner farmers to promote sustainable, water-efficient agriculture across Uttar Pradesh.",
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80"
  }
];

const SupportFarmersPage = () => {
  return (
    <div className="support-farmers-page">
      {/* --- Hero Section --- */}
      <section className="support-hero">
        <div className="hero-overlay">
          <h1 className="page-title">Empowering the Hands That Feed Us</h1>
          <p className="main-slogan">
            At ZYAGRA, we don't just buy produce; we invest in the people who grow it. 
            Discover how we are building a sustainable future together.
          </p>
        </div>
      </section>

      {/* --- Impact Stats Section --- */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h2 className="stat-value">₹50 Lakh+</h2>
            <p className="stat-label">Directly Reinvested in Farming Communities</p>
          </div>
          <div className="stat-card">
            <h2 className="stat-value">1,500+</h2>
            <p className="stat-label">Farmers Empowered Digitally</p>
          </div>
          <div className="stat-card">
            <h2 className="stat-value">2,000+</h2>
            <p className="stat-label">Acres Transitioned to Organic</p>
          </div>
          <div className="stat-card">
            <h2 className="stat-value">0</h2>
            <p className="stat-label">Middlemen Involved in Our Supply Chain</p>
          </div>
        </div>
      </section>

      {/* --- How ZYAGRA Deals With Farmers --- */}
      <section className="partnership-section light-bg">
        <div className="section-content">
          <h2 className="section-title">The ZYAGRA Partnership Model</h2>
          <p className="section-subtitle">We believe in fair trade, transparency, and technology.</p>
          
          <div className="model-steps">
            <div className="step">
              <div className="step-icon">🤝</div>
              <h3>Direct Procurement</h3>
              <p>We bypass traditional mandis and middlemen, buying directly from the farm. This ensures farmers get up to 30% higher margins for their hard work.</p>
            </div>
            <div className="step">
              <div className="step-icon">⚡</div>
              <h3>Instant Payouts</h3>
              <p>No more waiting months for payments. Our digital platform ensures farmers receive fair, market-beating compensation directly into their bank accounts within 24 hours.</p>
            </div>
            <div className="step">
              <div className="step-icon">📈</div>
              <h3>Data-Driven Yields</h3>
              <p>We provide free weather forecasting and crop-demand data, helping our partners plant the right crops at the right time to avoid market gluts and maximize profits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Campaigns & Events Section --- */}
      <section className="campaigns-section">
        <div className="section-content">
          <h2 className="section-title">Active Campaigns & Events</h2>
          <div className="campaign-grid">
            {campaigns.map((camp, index) => (
              <div className="campaign-card" key={index}>
                <img src={camp.image} alt={camp.title} className="campaign-image" />
                <div className="campaign-info">
                  <span className="campaign-badge">{camp.date}</span>
                  <h3>{camp.title}</h3>
                  <p>{camp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Consumer Impact Section --- */}
      <section className="consumer-impact-section light-bg">
        <div className="section-content impact-flex">
          <div className="impact-text">
            <h2 className="section-title text-left">How Your Purchase Helps</h2>
            <p>
              Every time you choose ZYAGRA for your daily essentials, you trigger a chain reaction of positive change. 
            </p>
            <ul className="impact-list">
              <li><strong>Fair Wages:</strong> You guarantee a farmer receives a fair price above the market average.</li>
              <li><strong>Sustainable Funding:</strong> 5% of all ZYAGRA profits go directly into our 'Harit Fund' for agricultural training.</li>
              <li><strong>Zero Waste:</strong> By ordering digitally, you help us forecast demand, reducing food waste at the farm level by 40%.</li>
            </ul>
          </div>
          <div className="impact-image-wrapper">
            <img 
              src="https://www.shutterstock.com/shutterstock/videos/3481487983/thumb/6.jpg?ip=x480" 
              alt="Happy farmer holding produce" 
              className="impact-image"
            />
          </div>
        </div>
      </section>

      {/* --- Gallery Section --- */}
      <section className="gallery-section">
        <h2 className="section-title">Farmers in Action</h2>
        <div className="gallery-grid">
          <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80" alt="Farmer in field" className="gallery-image" />
          <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80" alt="Fresh produce harvest" className="gallery-image" />
          <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80" alt="Modern farming techniques" className="gallery-image" />
        </div>
      </section>

      {/* --- Call to Action --- */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-heading">Join the Agri-Revolution</h2>
          <p className="cta-slogan">Buy Local. Eat Fresh. Make a Global Impact.</p>
          <p className="cta-text">
            Ready to change the way you shop and support the backbone of our country? Fill your cart with purpose today.
          </p>
          <div className="cta-buttons">
            <a href="/products" className="cta-button primary">Shop Fresh Produce</a>
            <a href="/about" className="cta-button secondary">Learn More About Us</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportFarmersPage;