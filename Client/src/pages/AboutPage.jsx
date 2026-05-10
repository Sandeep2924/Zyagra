import React from "react";
import "../style/AboutPage.css";

// --- Team Members Data ---
const teamMembers = [
  {
    name: "Sandeep Kumar",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    bio: "Driving the vision of ZYAGRA, Sandeep leverages deep expertise in full-stack development and AI to bridge the gap between traditional farming and next-generation digital tools.",
  },
  {
    name: "Minakshee",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bio: "Minakshee is the strategic force behind our scalable supply chain, ensuring seamless integration between agricultural ecosystems and our digital commerce platform.",
  },
  {
    name: "Yasmin & Srishti",
    role: "Co-Chief Technology Officers",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
    bio: "Leading our engineering initiatives, Yasmin and Srishti architect the robust, high-performance systems that power ZYAGRA's intuitive and data-driven user experiences.",
  },
];

const AboutPage = () => {
  return (
    <div className="about-container modern-theme">
      {/* --- Hero Section --- */}
      <section className="about-hero glass-panel">
        <div className="hero-content">
          <h1 className="gradient-text">Pioneering the Future of Agri-Commerce</h1>
          <p className="hero-subtitle">
            We are digitizing the agricultural ecosystem, empowering farmers and consumers through intelligent, seamless technology.
          </p>
        </div>
      </section>

      {/* --- Our Mission Section --- */}
      <section className="about-section">
        <div className="section-content mission-section">
          <div className="mission-text">
            <h2 className="neon-accent">Our Mission 🎯</h2>
            <p>
              To revolutionize the agricultural supply chain by equipping farmers with accessible digital tools and connecting them directly to a broader market. At ZYAGRA, we are committed to fostering a sustainable, tech-driven ecosystem that maximizes yield profitability while ensuring the highest quality produce reaches the consumer.
            </p>
          </div>
          <div className="mission-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80"
              alt="Modern technology in agriculture"
              className="rounded-image shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* --- Our Story Section --- */}
      <section className="about-section dark-bg">
        <div className="section-content story-section glass-card">
          <h2 className="neon-accent">Our Story 🚀</h2>
          <p>
            ZYAGRA was born from a singular, powerful realization: the agricultural sector was ripe for technological disruption. Recognizing the disconnect between hardworking farmers and modern market infrastructure, our team set out to build a comprehensive digital bridge. What began as a bold concept has rapidly scaled into a premier smart agri-commerce platform. Today, ZYAGRA stands at the forefront of agricultural innovation, redefining how produce is managed, marketed, and delivered in the digital age.
          </p>
        </div>
      </section>

      {/* --- Meet the Team Section --- */}
      <section className="about-section">
        <div className="section-content team-section">
          <h2 className="text-center">The Minds Behind ZYAGRA 🧠</h2>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.name} className="team-member-card glassmorphism-card hover-scale">
                <div className="image-container">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-member-image"
                  />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <h4 className="role-text">{member.role}</h4>
                  <p>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;