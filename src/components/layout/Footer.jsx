import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Share2, ExternalLink, Mail } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import './layout.css';

export const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container footer-container">
        <div className="footer-brand-col">
          <Link to="/" className="nav-brand" aria-label="Just Enough Home">
            <BrandLogo variant="light" height={36} />
          </Link>
          <p className="footer-description">
            AI-powered demand forecasting and food waste reduction platform for smart restaurants, bakeries, cafes, and food producers.
          </p>
          <div className="social-links">
            <a href="#global" aria-label="Website" className="social-icon"><Globe size={18} /></a>
            <a href="#share" aria-label="Share" className="social-icon"><Share2 size={18} /></a>
            <a href="#link" aria-label="External Link" className="social-icon"><ExternalLink size={18} /></a>
            <a href="#mail" aria-label="Contact Email" className="social-icon"><Mail size={18} /></a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Product</h4>
            <a href="#product">Overview</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">AI Engine</a>
            <Link to="/inventory">Inventory Intelligence</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#about">About Us</a>
            <a href="#careers">Careers</a>
            <a href="#sustainability">Sustainability Plan</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-col">
            <h4>Legal & Trust</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#security">Data Security</a>
            <a href="#compliance">SOC2 Compliance</a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Just Enough Inc. All rights reserved.</p>
        <div className="eco-pill">
          <Leaf size={14} color="#199B74" />
          <span>Helping prevent 12,000+ lbs of food waste monthly</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
