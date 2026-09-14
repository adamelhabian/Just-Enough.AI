import React from 'react';
import { TrendingUp, ChefHat, Boxes, BarChart3, ShieldCheck, Link2 } from 'lucide-react';
import './landing.css';

export const FeaturesSection = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Demand Forecasting',
      desc: 'Predict exact item quantities hours or days ahead based on historical trend curves and external variables.',
      tag: 'AI Core'
    },
    {
      icon: ChefHat,
      title: 'Production Planning',
      desc: 'Automatically generate daily kitchen prep sheets for morning shifts to streamline kitchen labor and prep work.',
      tag: 'Kitchen Workflow'
    },
    {
      icon: Boxes,
      title: 'Inventory Intelligence',
      desc: 'Translate predicted item sales into precise raw ingredient breakdown to know stock depletion before service.',
      tag: 'Smart Inventory'
    },
    {
      icon: BarChart3,
      title: 'Sales Analytics',
      desc: 'Deep dive into hourly demand curves, menu item profitability, and seasonal customer ordering behavior.',
      tag: 'Deep Insights'
    },
    {
      icon: ShieldCheck,
      title: 'Prediction Confidence',
      desc: 'Every recommendation is accompanied by an AI confidence score so managers can make informed final decisions.',
      tag: 'Trust & Safety'
    },
    {
      icon: Link2,
      title: 'Seamless Integrations',
      desc: 'Connect directly with Toast, Square, Clover, and major POS/ERP systems without changing your current tech stack.',
      tag: 'Plug & Play'
    }
  ];

  return (
    <section id="benefits" className="section-padding features-section reveal-on-scroll">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-badge">Platform Capabilities</span>
          <h2>Built specifically for high-efficiency food businesses.</h2>
          <p>Everything your kitchen operations team needs to eliminate waste and maximize profitability.</p>
        </div>

        <div className="features-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="feature-card">
                <div className="feature-top">
                  <div className="feature-icon-box">
                    <Icon size={22} />
                  </div>
                  <span className="feature-tag">{feat.tag}</span>
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
