import React from 'react';
import { AlertCircle, TrendingDown, Scale, CheckCircle2 } from 'lucide-react';
import './landing.css';

export const ProblemSection = () => {
  return (
    <section id="product" className="section-padding problem-section reveal-on-scroll">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-badge">The Kitchen Dilemma</span>
          <h2>Food waste starts before the kitchen does.</h2>
          <p>Traditional guessing leads to two costly traps for every food business.</p>
        </div>

        <div className="problem-cards-grid">
          {/* Overproduction Card */}
          <div className="problem-card card-overproduction">
            <div className="p-card-header">
              <div className="p-icon-circle bg-red">
                <TrendingDown size={22} color="#B94419" />
              </div>
              <div>
                <h3>OVERPRODUCTION</h3>
                <span className="p-subtitle">Producing too much</span>
              </div>
            </div>
            <ul className="problem-list">
              <li>
                <span className="bullet-dot red"></span>
                <span>Unsold food tossed at closing</span>
              </li>
              <li>
                <span className="bullet-dot red"></span>
                <span>Wasted raw ingredients & shelf life</span>
              </li>
              <li>
                <span className="bullet-dot red"></span>
                <span>Directly lost gross margin & profits</span>
              </li>
            </ul>
          </div>

          {/* Underproduction Card */}
          <div className="problem-card card-underproduction">
            <div className="p-card-header">
              <div className="p-icon-circle bg-amber">
                <AlertCircle size={22} color="#E5B141" />
              </div>
              <div>
                <h3>UNDERPRODUCTION</h3>
                <span className="p-subtitle">Producing too little</span>
              </div>
            </div>
            <ul className="problem-list">
              <li>
                <span className="bullet-dot amber"></span>
                <span>Stock shortages during peak rush</span>
              </li>
              <li>
                <span className="bullet-dot amber"></span>
                <span>Missed sales revenue & orders</span>
              </li>
              <li>
                <span className="bullet-dot amber"></span>
                <span>Unhappy customers leaving for competitors</span>
              </li>
            </ul>
          </div>
        </div>

        {/* The Balance Visual */}
        <div className="balance-solution-box">
          <div className="balance-scale-visual">
            <Scale size={32} color="#199B74" className="balance-icon" />
            <div className="scale-beam"></div>
            <div className="scale-pan pan-left">Over</div>
            <div className="scale-center-badge">
              <CheckCircle2 size={18} color="#FFF" />
              <span>JUST ENOUGH</span>
            </div>
            <div className="scale-pan pan-right">Under</div>
          </div>
          <div className="balance-text">
            <h3>The Intelligent Balance</h3>
            <p>
              Just Enough predicts exact customer demand day-by-day so you produce precisely what will sell—no more, no less.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
