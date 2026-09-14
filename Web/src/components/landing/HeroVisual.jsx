import React from 'react';
import { TrendingUp, Sparkles, ChefHat, Boxes, ArrowRight, ShieldCheck, PieChart, CheckCircle2 } from 'lucide-react';
import './landing.css';

export const HeroVisual = () => {
  return (
    <div className="hero-visual-wrapper">
      {/* Central Pipeline Visual */}
      <div className="hero-pipeline-card">
        <div className="pipeline-header">
          <div className="dot red"></div>
          <div className="dot yellow"></div>
          <div className="dot green"></div>
          <span className="pipeline-title">JUST ENOUGH - REALTIME DEMAND ENGINE</span>
        </div>

        <div className="pipeline-flow">
          <div className="pipe-node">
            <div className="node-icon bg-amber">
              <TrendingUp size={22} color="#E5B141" />
            </div>
            <span className="node-label">Sales Data</span>
            <span className="node-sub">POS Sync</span>
          </div>

          <div className="pipe-connector">
            <div className="pipe-line"></div>
            <ArrowRight size={14} className="pipe-arrow" />
          </div>

          <div className="pipe-node highlight-node">
            <div className="node-icon bg-emerald animate-pulse-glow">
              <Sparkles size={24} color="#199B74" />
            </div>
            <span className="node-label text-emerald">AI Forecast</span>
            <span className="node-sub">94.8% Acc</span>
          </div>

          <div className="pipe-connector">
            <div className="pipe-line"></div>
            <ArrowRight size={14} className="pipe-arrow" />
          </div>

          <div className="pipe-node">
            <div className="node-icon bg-terracotta">
              <ChefHat size={22} color="#B94419" />
            </div>
            <span className="node-label">Production Plan</span>
            <span className="node-sub">Optimal Prep</span>
          </div>

          <div className="pipe-connector">
            <div className="pipe-line"></div>
            <ArrowRight size={14} className="pipe-arrow" />
          </div>

          <div className="pipe-node">
            <div className="node-icon bg-cream">
              <Boxes size={22} color="#56473A" />
            </div>
            <span className="node-label">Inventory</span>
            <span className="node-sub">3.4d Coverage</span>
          </div>

          <div className="pipe-connector">
            <div className="pipe-line"></div>
            <ArrowRight size={14} className="pipe-arrow" />
          </div>

          <div className="pipe-node success-node">
            <div className="node-icon bg-mint">
              <ShieldCheck size={22} color="#199B74" />
            </div>
            <span className="node-label text-emerald">Less Waste</span>
            <span className="node-sub">-23% Loss</span>
          </div>
        </div>
      </div>

      {/* Floating Animated Cards Around Visual */}
      <div className="floating-card float-1 animate-float">
        <div className="f-icon bg-emerald-light">
          <TrendingUp size={16} color="#FFF" />
        </div>
        <div className="f-text">
          <span className="f-title">Tomorrow’s Demand</span>
          <strong className="f-val text-emerald">+18% Surge</strong>
        </div>
      </div>

      <div className="floating-card float-2 animate-float-delayed">
        <div className="f-icon bg-terracotta-light">
          <ChefHat size={16} color="#FFF" />
        </div>
        <div className="f-text">
          <span className="f-title">Chicken Required</span>
          <strong className="f-val">18.2 kg precise</strong>
        </div>
      </div>

      <div className="floating-card float-3 animate-float-reverse">
        <div className="f-icon bg-mint">
          <ShieldCheck size={16} color="#199B74" />
        </div>
        <div className="f-text">
          <span className="f-title">Waste Risk</span>
          <strong className="f-val text-emerald">↓ 23% Reduced</strong>
        </div>
      </div>

      <div className="floating-card float-4 animate-float">
        <div className="f-icon bg-amber">
          <PieChart size={16} color="#FFF" />
        </div>
        <div className="f-text">
          <span className="f-title">Forecast Accuracy</span>
          <strong className="f-val">94.8%</strong>
        </div>
      </div>
    </div>
  );
};

export default HeroVisual;
