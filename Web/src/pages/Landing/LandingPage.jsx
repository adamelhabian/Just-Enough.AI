import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Button from '../../components/common/Button';
import HeroVisual from '../../components/landing/HeroVisual';
import ProblemSection from '../../components/landing/ProblemSection';
import HowItWorks from '../../components/landing/HowItWorks';
import AiExplanation from '../../components/landing/AiExplanation';
import FeaturesSection from '../../components/landing/FeaturesSection';
import SustainabilitySection from '../../components/landing/SustainabilitySection';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import '../../components/landing/landing.css';

export const LandingPage = () => {
  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="landing-page-shell">
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-pill animate-pulse-glow">
              <Sparkles size={16} color="#199B74" />
              <span>Next-Gen Food Tech Intelligence</span>
            </div>

            <h1 className="hero-title">
              Know what to make.<br />
              <span className="accent">Before you make it.</span>
            </h1>

            <p className="hero-sub">
              Just Enough uses AI to predict demand, plan daily kitchen production, and reduce food waste for smart restaurants, bakeries, and cafes.
            </p>

            <div className="hero-btn-group">
              <Link to="/signup">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                  Start Forecasting
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" icon={Play}>
                  See How It Works
                </Button>
              </a>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* Problem Section */}
      <ProblemSection />

      {/* How It Works */}
      <HowItWorks />

      {/* AI Explanation Interactive Section */}
      <AiExplanation />

      {/* Features Grid */}
      <FeaturesSection />

      {/* Sustainability Section */}
      <SustainabilitySection />

      {/* Final CTA Section */}
      <section className="cta-section reveal-on-scroll">
        <div className="container">
          <div className="cta-box">
            <h2>Stop guessing. Start predicting.</h2>
            <p className="hero-sub" style={{ fontSize: '1.1rem' }}>
              Turn your sales data into smarter production decisions, zero inventory waste, and higher kitchen margins.
            </p>
            <div className="hero-btn-group">
              <Link to="/signup">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                  Start Forecasting
                </Button>
              </Link>
              <Link to="/inventory">
                <Button variant="secondary" size="lg">
                  Explore the Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
