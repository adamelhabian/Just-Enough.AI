import React from 'react';
import { Leaf, Award, Recycle, HeartHandshake } from 'lucide-react';
import './landing.css';

export const SustainabilitySection = () => {
  return (
    <section id="sustainability" className="sustainability-section reveal-on-scroll">
      <div className="sustainability-bg-blob"></div>
      <div className="container sustainability-container">
        <div className="sustainability-content">
          <div className="eco-header-badge">
            <Leaf size={16} color="#199B74" />
            <span>Environmental Impact & Bottom Line</span>
          </div>

          <h2>Make less waste.<br />Make smarter decisions.</h2>

          <p className="sustainability-lead">
            Better predictions mean better production decisions, fewer unnecessary ingredients, and less food going to landfill. Sustainable operations are profitable operations.
          </p>

          <div className="sustainability-metrics-row">
            <div className="metric-box">
              <span className="metric-num text-emerald animate-pulse-glow">23%</span>
              <span className="metric-label">Average Food Waste Reduction</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">1,248+</span>
              <span className="metric-label">Active Kitchens & Bakeries</span>
            </div>
            <div className="metric-box">
              <span className="metric-num text-amber">$1,450</span>
              <span className="metric-label">Avg. Monthly Ingredient Savings</span>
            </div>
          </div>
        </div>

        <div className="sustainability-visual-card">
          <div className="impact-badge-header">
            <Award size={20} color="#199B74" />
            <span>Sustainability Impact Report</span>
          </div>

          <div className="impact-list">
            <div className="impact-item">
              <div className="impact-icon-circle">
                <Recycle size={18} color="#199B74" />
              </div>
              <div>
                <strong>3.2 Tons CO₂ Avoided</strong>
                <span>Per location annually through optimized inventory sourcing.</span>
              </div>
            </div>

            <div className="impact-item">
              <div className="impact-icon-circle">
                <HeartHandshake size={18} color="#E5B141" />
              </div>
              <div>
                <strong>Local Food Bank Synergy</strong>
                <span>Automated surplus notifications for local food donation centers.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SustainabilitySection;
