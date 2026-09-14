import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sparkles, ChefHat, Boxes, ArrowRight, ShieldCheck } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import './layouts.css';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-shell">
      {/* Left Branded Visual Side */}
      <div className="auth-brand-side">
        <Link to="/" className="auth-brand-logo" aria-label="Just Enough Home">
          <BrandLogo variant="light" height={40} />
        </Link>

        <div className="auth-brand-hero">
          <span className="auth-tag">AI Demand Intelligence</span>
          <h2>Make every decision count.</h2>
          <p>
            Eliminate food waste before it happens. Just Enough connects historical sales with AI forecasting to optimize daily kitchen production.
          </p>

          {/* Animated Flow Visualization */}
          <div className="auth-flow-container">
            <div className="flow-step">
              <TrendingUp size={18} color="#E5B141" />
              <span>Sales Data</span>
            </div>
            <ArrowRight size={14} className="flow-arrow" />
            <div className="flow-step highlight">
              <Sparkles size={18} color="#199B74" />
              <span>AI Forecast</span>
            </div>
            <ArrowRight size={14} className="flow-arrow" />
            <div className="flow-step">
              <ChefHat size={18} color="#B94419" />
              <span>Production</span>
            </div>
            <ArrowRight size={14} className="flow-arrow" />
            <div className="flow-step">
              <Boxes size={18} color="#DBD9D5" />
              <span>Zero Waste</span>
            </div>
          </div>

          {/* Floating Feature Cards */}
          <div className="auth-floating-cards">
            <div className="auth-float-card card-1 animate-float">
              <Sparkles size={16} color="#199B74" />
              <div>
                <strong>+18% Weekend Surge</strong>
                <span>AI Confidence: 96%</span>
              </div>
            </div>

            <div className="auth-float-card card-2 animate-float-delayed">
              <ShieldCheck size={16} color="#E5B141" />
              <div>
                <strong>23% Less Waste</strong>
                <span>$1,450 Monthly Savings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          <span>Trusted by 1,200+ smart kitchens & bakeries</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-form-side">
        <div className="auth-form-box page-transition">
          <div className="auth-form-header">
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
