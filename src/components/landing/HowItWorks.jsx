import React from 'react';
import { Database, Sparkles, ChefHat, Boxes } from 'lucide-react';
import './landing.css';

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Collect Data',
      icon: Database,
      desc: 'Seamlessly aggregates historical sales, POS transactions, weather forecasts, holidays, and local events.',
      tags: ['Historical sales', 'Recent demand', 'Weather', 'Events']
    },
    {
      number: '02',
      title: 'Predict Demand',
      icon: Sparkles,
      desc: 'Proprietary AI analyzes recurring patterns, seasonality, and trend shifts to project exact item orders.',
      tags: ['Machine Learning', '94.8% Accuracy', 'Confidence Score']
    },
    {
      number: '03',
      title: 'Plan Production',
      icon: ChefHat,
      desc: 'Translates predictions into actionable daily prep sheets for kitchen teams before morning prep begins.',
      tags: ['Daily Prep Sheets', 'Prep Batching', 'Zero Waste Buffer']
    },
    {
      number: '04',
      title: 'Optimize Inventory',
      icon: Boxes,
      desc: 'Determines precise raw ingredient breakdown to automate supplier reordering and prevent overstock.',
      tags: ['Ingredient Breakdown', 'Low Stock Alerts', 'Reorder Triggers']
    }
  ];

  return (
    <section id="how-it-works" className="section-padding how-section reveal-on-scroll">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-badge">Simple 4-Step Process</span>
          <h2>From yesterday's sales to tomorrow's decisions.</h2>
          <p>Four automated steps to transform guesswork into predictable kitchen operations.</p>
        </div>

        <div className="how-steps-grid">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="how-step-card">
                <div className="step-num-badge">{step.number}</div>
                <div className="step-icon-box">
                  <Icon size={24} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className="step-tags">
                  {step.tags.map((t, i) => (
                    <span key={i} className="step-tag">{t}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
