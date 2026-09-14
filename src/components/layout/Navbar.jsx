import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import BrandLogo from '../common/BrandLogo';
import './layout.css';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`landing-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-brand" onClick={closeMenu} aria-label="Just Enough Home">
          <BrandLogo variant="dark" height={38} />
        </Link>

        {/* Desktop Nav Items */}
        <nav className="nav-links desktop-only">
          <a href="#product" className="nav-link">Product</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#benefits" className="nav-link">Benefits</a>
        </nav>

        {/* Right CTA */}
        <div className="nav-actions desktop-only">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-hamburger mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-menu mobile-only">
          <a href="#product" onClick={closeMenu}>Product</a>
          <a href="#how-it-works" onClick={closeMenu}>How It Works</a>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#benefits" onClick={closeMenu}>Benefits</a>
          <hr className="mobile-divider" />
          <div className="mobile-cta-group">
            <Link to="/login" onClick={closeMenu}>
              <Button variant="outline" fullWidth>Log In</Button>
            </Link>
            <Link to="/signup" onClick={closeMenu}>
              <Button variant="primary" fullWidth>Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
